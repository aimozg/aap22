import {Entity} from "./Entity";
import {EntityClassLoader} from "./EntityClassLoader";
import {GameObject} from "./GameObject";
import {Effect} from "./Effect";
import {objectClassName, objectToString} from "../../utils/types";
import {EntityDataDescriptor, getEntityDataDescriptors} from "./decorators";
import {StatId, StatValues} from "./ObjectStat";
import {ObjectComponent} from "./ObjectComponent";
import {compressEntityJson, decompressEntityJson} from "./compress";

export class EntityLoaderError extends Error {
	constructor(context: EntityLoader, message: string, cause?: Error) {
		super(`Error loading ${context.contextPath}: ${message}`,
			cause ? {cause: cause} : undefined);
		if (cause) {
			this.stack += `\nCaused by ${cause.stack}`;
		}
		Object.setPrototypeOf(this, EntityLoaderError.prototype);
	}
}

export interface EntityJson {
	clsid: string;
	uuid: number;
	bpid?: string;
	data?: Record<string, any>;
	stats?: StatValues;
	components?: EntityJson[];
	effects?: EntityJson[];
	children?: [unknown, EntityJson][];
}

export class EntityLoader {

	get contextPath(): string {
		return this.path.join('.');
	}

	private classLoaders = new Map<string, EntityClassLoader<Entity>>()

	registerClassLoader(c: EntityClassLoader<Entity>) {
		this.classLoaders.set(c.clsid, c);
	}

	findContext(clsid:string):EntityJson|undefined {
		for (let i = this.context.length-1; i>=0; i--) {
			if (this.context[i].clsid === clsid) return this.context[i];
		}
		return undefined;
	}

	context: EntityJson[]          = [];
	private path: string[]         = [];
	private references: {
		target: Entity,
		context: string,
		field: string,
		uuid: number
	}[];
	private entitiesWithReferences = new Set<Entity>();
	private entities               = new Map<number, Entity>();

	private clear() {
		this.path       = [];
		this.references = [];
		this.entities.clear();
		this.entitiesWithReferences.clear();
	}

	private enter(key: string, ej?: EntityJson) {
		this.path.push(key);
	}
	private enterEJ(ej:EntityJson) {
		this.context.push(ej);
	}

	private exit(key: string) {
		let x = this.path.pop();
		if (x !== key) throw new Error(`Inconsistent EntityLoader stack: ${this.contextPath}.${x}, expected ${key}`);
	}
	private exitEJ(ej:EntityJson) {
		let x = this.context.pop();
		if (x !== ej) throw new Error(`Inconsistent EntityLoader context stack at ${this.contextPath}: ${x?.clsid}#${x?.uuid}, expected ${ej.clsid}#${ej.uuid}`);
	}

	serializeValue(x: unknown): unknown {
		if (typeof x === "symbol" || typeof x === "bigint" || typeof x === "function") {
			this.error(`Cannot serialize ${typeof x}`);
		}
		if (x === null || typeof x !== "object") return x;
		if (x instanceof Set) return [...x];
		if (x instanceof Map) {
			let result: Record<string, unknown> = {};
			x.forEach((v, k) => result[k] = this.serializeValue(v));
			return result;
		}
		if (Array.isArray(x)) {
			return x.map(xi => this.serializeValue(xi));
		}
		let result: Record<string, unknown> = {};
		for (let [k, v] of Object.entries(x)) {
			result[k] = this.serializeValue(v);
		}
		return result;
	}

	serializeRoot(root: Entity): EntityJson {
		this.clear();
		let output = this.serializeEntity(root, "$");
		this.clear();
		return output;
	}

	save(root: Entity): ArrayBuffer {
		return compressEntityJson(this.serializeRoot(root));
	}

	load(input: ArrayBuffer): Entity {
		return this.deserializeRoot(decompressEntityJson(input));
	}

	serializeEntity(entity: Entity, key?: string): EntityJson {
		if (key) this.enter(key);
		try {
			entity.beforeSave?.(this);
		} catch (e) {
			this.error(e);
		}
		let out: EntityJson = {
			clsid: entity.clsid,
			uuid: entity.uuid
		}
		this.enterEJ(out);
		if (entity.bpid) out.bpid = entity.bpid;
		let datas = getEntityDataDescriptors(entity);
		if (datas.length > 0 || entity.saveCustomData) {
			out.data = {};
			for (let d of datas) {
				this.enter(d.field);
				let value        = (entity as any)[d.field];
				out.data[d.name] = this.serializeDataField(value, d);
				this.exit(d.field);
			}
			entity.saveCustomData?.(out.data, this);
		}
		if (entity instanceof GameObject) {
			this.writeObjectData(entity, out);
		} else if (entity instanceof Effect) {
			this.writeEffectData(entity, out);
		} else this.error(`Cannot serialize ${objectClassName(entity)}`);
		if (key) this.exit(key);
		this.exitEJ(out);
		return out;
	}

	private serializeDataField(value: unknown, descriptor: EntityDataDescriptor): any {
		switch (descriptor.type) {
			case "clone":
				return this.serializeValue(value);
			case "reference":
				if (value) {
					if (!(value instanceof Entity)) this.error(`Not an entity: ${value}`);
					return value.uuid;
				}
				return null;
		}
	}

	private writeObjectData(obj: GameObject, out: EntityJson) {
		if (obj.components.length > 0) {
			out.components = obj.components.map(c => this.serializeEntity(c, 'Component#' + c.uuid));
		}
		if (obj.effects.length > 0) {
			out.effects = obj.effects.map(e => this.serializeEntity(e, 'Effect#' + e.uuid));
		}
		if (obj.stats.size > 0) {
			out.stats = {};
			obj.stats.forEach((value, key) => {
				out.stats![key] = value.base;
			});
		}
		let c = obj.saveChildren();
		if (c.length > 0) {
			out.children = c.map(([pos, child]) => [
				pos,
				this.serializeEntity(child, 'Child#' + pos)
			])
		}
	}

	private writeEffectData(eff: Effect<GameObject>, out: EntityJson) {
		if (eff.stats && eff.stats.size > 0) {
			out.stats = {};
			eff.stats.forEach((value, key) => {
				out.stats![key] = value;
			});
		}
	}

	deserializeRoot(rootJson: EntityJson): Entity {
		this.clear();
		let root = this.deserializeEntity(rootJson, "$");
		this.enter("[references]");
		this.references.forEach(reference => {
			let entity = this.entities.get(reference.uuid);
			if (!entity) {
				this.error(`Property ${reference.context} refers unknown entity #${reference.uuid}`)
			} else {
				(reference.target as any)[reference.field] = entity;
			}
		})
		this.exit("[references]");
		this.enter("[callbacks]");
		this.entitiesWithReferences.forEach(e => e.afterLoad?.(this));
		this.exit("[callbacks]");
		this.clear();
		return root;
	}

	deserializeEntity(input: EntityJson, key?: string): Entity {
		if (key) this.enter(key);
		this.requireType(input, "object");
		this.enterEJ(input);
		let clsid = input.clsid;
		let bpid  = input.bpid;
		let uuid  = input.uuid;
		this.requireType(clsid, "string", "[clsid]");
		if (bpid) this.requireType(bpid, "string", "[bpid]");
		this.requireType(uuid, "number", "[uuid]");
		if (this.entities.has(uuid)) {
			this.error(`Duplicate entity #${uuid}`);
		}
		let classLoader = this.classLoaders.get(clsid);
		if (!classLoader) this.error(`unknown entity #${uuid} class '${clsid}'`);
		let entity: Entity;
		try {
			entity = classLoader.create(input, this);
		} catch (e) {
			this.error(e);
		}
		this.deserializeEntityData(entity, input);
		if (entity instanceof GameObject) {
			this.deserializeObjectFields(entity, input);
		} else if (entity instanceof Effect) {
			this.deserializeEffectFields(entity, input);
		} else this.error(`Cannot deserialize ${objectClassName(entity)}`);
		if (entity.afterLoad && !this.entitiesWithReferences.has(entity)) {
			try {
				entity.afterLoad(this);
			} catch (e) {
				this.error(e);
			}
		}
		this.entities.set(uuid, entity);
		if (key) this.exit(key);
		this.exitEJ(input);
		return entity;
	}

	deserializeEntityData(entity: Entity, input: EntityJson) {
		if (input.data) {
			this.enter("data");
			this.requireType(input.data, "object");
			try {
				entity.loadCustomData?.(input.data, this);
			} catch (e) {
				this.error(e);
			}
			let descriptors = getEntityDataDescriptors(entity);
			for (let descriptor of descriptors) {
				this.enter(descriptor.field);
				let value: unknown = input.data[descriptor.name];
				switch (descriptor.type) {
					case "clone":
						this.deserializeValue(entity, descriptor.field, value);
						break;
					case "reference":
						if (value !== null) {
							this.requireType(value, "number", "uuid");
							this.deserializeReference(entity, descriptor.field, value as number);
						}
						break;
					default:
						this.error(`Invalid EntityDataDescriptor ${descriptor.type}`);
				}
				this.exit(descriptor.field);
			}
			this.exit("data")
		}
	}

	deserializeReference(target: Entity, field: string, uuid: number) {
		this.entitiesWithReferences.add(target);
		this.references.push({
			target,
			field,
			uuid,
			context: this.contextPath
		})
	}

	deserializeValue(entity: Entity, key: string, value: unknown) {
		// TODO either support nested complex values, or throw error on their serialization attempts.
		let oldValue = (entity as any)[key];
		if (oldValue instanceof Set) {
			oldValue.clear();
			for (let x of (value as unknown[])) {
				oldValue.add(x);
			}
		} else if (oldValue instanceof Map) {
			oldValue.clear();
			for (let [k, v] of Object.entries(value as Record<string, unknown>)) {
				oldValue.set(k, v);
			}
		} else (entity as any)[key] = structuredClone(value);
	}

	private deserializeEffectFields(effect: Effect<GameObject>, input: EntityJson) {
		if (input.stats) {
			this.enter("stats");
			this.requireType(input.stats, "object");
			effect.stats ??= new Map();
			for (let [k, v] of Object.entries(input.stats)) {
				this.requireType(v, "number", k)
				effect.stats.set(k as StatId, v);
			}
			this.exit("stats");
		}
	}

	private deserializeObjectFields(object: GameObject, input: EntityJson) {
		if (input.components) {
			this.enter("components")
			this.requireType(input.components, "array");
			for (let i = 0; i < input.components.length; i++) {
				this.enter(String(i));
				let clsid = input.components[i].clsid;
				let existingComponent = object.components.find(c=>c.clsid===clsid);
				if (existingComponent) {
					// TODO changing UUID is a hack - maybe loader should be responsible to create components with proper UUIDs?
					(existingComponent as any).uuid = input.components[i].uuid;
					this.deserializeEntityData(existingComponent, input.components[i]);
					this.deserializeObjectFields(existingComponent, input.components[i]);
					this.entities.set(existingComponent.uuid, existingComponent);
				} else {
					let component = this.deserializeEntity(input.components[i]);
					if (!(component instanceof ObjectComponent)) {
						this.error(`Expected ObjectComponent, got ${component.clsid}`);
					}
					component.addTo(object);
				}
				this.exit(String(i));
			}
			this.exit("components")
		}
		if (input.effects) {
			this.enter("effects")
			this.requireType(input.effects, "array");
			for (let i = 0; i < input.effects.length; i++) {
				this.enter(String(i));
				let effect = this.deserializeEntity(input.effects[i]);
				if (!(effect instanceof Effect)) {
					this.error(`Expected Effect, got ${effect.clsid}`);
				}
				effect.addTo(object);
				this.exit(String(i));
			}
			this.exit("effects")
		}
		if (input.stats) {
			this.enter("stats");
			this.requireType(input.stats, "object");
			for (let [k, v] of Object.entries(input.stats)) {
				this.requireType(v, "number", k);
				object.setStatBaseValue(k as StatId, v, false);
			}
			this.exit("stats");
		}
		if (input.children) {
			this.enter("children")
			this.requireType(input.children, "array");
			for (let i = 0; i < input.children.length; i++) {
				this.enter(String(i));
				let entry = input.children[i];
				this.requireType(entry, "array");
				if (entry.length !== 2) this.error(`Invalid child entry size ${entry.length}`);
				this.exit(String(i));
				let [pos, jchild] = entry;
				let spos          = objectToString(pos);
				this.enter(spos);
				let child = this.deserializeEntity(jchild);
				if (!(child instanceof GameObject)) {
					this.error(`Expected GameObject, got ${child.clsid}`);
				}
				try {
					child.setParentObject(object);
					object.loadChild(pos, child);
				} catch (e) {
					this.error(e);
				}
				this.exit(spos);
			}
			this.exit("children")
		}
	}

	requireType(value: unknown, type: string, key?: string) {
		if (type === "array") {
			if (!Array.isArray(value)) {
				if (key) this.enter(key);
				this.error(`Expected array, got ${value}`);
			}
			return;
		}
		if (typeof value !== type || value === null) {
			if (key) this.enter(key);
			this.error(`Expected ${type}, got ${value}`);
		}
	}

	error(e: unknown): never {
		if (e instanceof Error) throw new EntityLoaderError(this, e.message, e);
		throw new EntityLoaderError(this, objectToString(e));
	}
}


