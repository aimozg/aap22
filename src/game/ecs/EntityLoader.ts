import {Entity} from "./Entity";
import {EntityClassLoader} from "./EntityClassLoader";
import {GameObject} from "./GameObject";
import {Effect} from "./Effect";
import {objectClassName, objectToString} from "../../utils/types";
import {getEntityDataEntries} from "./decorators";
import {StatId} from "./ObjectStat";
import {ObjectComponent} from "./ObjectComponent";

export class EntityLoaderError extends Error {
	constructor(context: EntityLoader, message: string, cause?:Error) {
		super(`Error loading ${context.context}: ${message}`,
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
	stats?: Partial<Record<StatId, number>>;
	components?: EntityJson[];
	effects?: EntityJson[];
	children?: [any, EntityJson][];
}

export class EntityLoader {

	get context(): string {
		return this.path.join('.');
	}

	private classLoaders = new Map<string, EntityClassLoader<any>>()
	registerClassLoader(c:EntityClassLoader<any>) {
		this.classLoaders.set(c.clsid, c);
	}

	private path = ["$"];

	private enter(key: string) {
		this.path.push(key);
	}

	private exit(key: string) {
		let x = this.path.pop();
		if (x !== key) throw new Error(`Inconsistent EntityLoader stack: ${this.context}.${x}, expected ${key}`);
	}

	serializeValue(x:any):any {
		if (typeof x === "symbol" || typeof x === "bigint" || typeof x === "function") {
			this.error(`Cannot serialize ${typeof x}`);
		}
		if (x === null || typeof x !== "object") return x;
		if (x instanceof Set) return [...x];
		if (x instanceof Map) {
			let result:any = {};
			x.forEach((v,k)=>result[k]=this.serializeValue(v));
			return result;
		}
		if (Array.isArray(x)) {
			return x.map(xi=>this.serializeValue(xi));
		}
		let result:any = {};
		for (let [k,v] of Object.entries(x)) {
			result[k] = this.serializeValue(v);
		}
		return result;
	}
	serialize(entity: Entity, key?: string): EntityJson {
		if (key) this.enter(key);
		let out: EntityJson = {
			clsid: entity.clsid,
			uuid: entity.uuid
		}
		if (entity.bpid) out.bpid = entity.bpid;
		let d = getEntityDataEntries(entity);
		if (d.length > 0 || entity.saveCustomData) {
			out.data = {};
			for (let [k,v] of d) {
				out.data[k] = this.serializeValue(v);
			}
			entity.saveCustomData?.(out.data);
		}
		if (entity instanceof GameObject) {
			this.writeObjectData(entity, out);
		} else if (entity instanceof Effect) {
			this.writeEffectData(entity, out);
		} else this.error(`Cannot serialize ${objectClassName(entity)}`);
		if (key) this.exit(key);
		return out;
	}

	private writeObjectData(obj: GameObject, out: EntityJson) {
		if (obj.components.length > 0) {
			out.components = obj.components.map(c => this.serialize(c, 'Component#' + c.uuid));
		}
		if (obj.effects.length > 0) {
			out.effects = obj.effects.map(e => this.serialize(e, 'Effect#' + e.uuid));
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
				this.serialize(child, 'Child#' + pos)
			])
		}
	}

	private writeEffectData(eff: Effect<any>, out: EntityJson) {
		if (eff.stats && eff.stats.size > 0) {
			out.stats = {};
			eff.stats.forEach((value, key) => {
				out.stats![key] = value;
			});
		}
	}

	deserialize(input: EntityJson, key?: string): Entity {
		if (key) this.enter(key);
		let clsid       = input.clsid;
		let bpid        = input.bpid;
		let uuid        = input.uuid;
		this.requireType(clsid,"string","[clsid]");
		if (bpid) this.requireType(bpid,"string","[bpid]");
		this.requireType(uuid,"number","[uuid]");
		let classLoader = this.classLoaders.get(clsid);
		if (!classLoader) this.error(`unknown entity class '${clsid}'`);
		let entity: Entity;
		try {
			entity = classLoader.create(input, this);
		} catch (e) {
			this.error(e);
		}
		if (entity instanceof GameObject) {
			this.deserializeObjectFields(entity, input);
		} else if (entity instanceof Effect) {
			this.deserializeEffectFields(entity, input);
		} else this.error(`Cannot deserialize ${objectClassName(entity)}`);
		if (key) this.exit(key);
		return entity;
	}

	deserializeValue(entity:Entity, key:string, value:any) {
		// TODO either support nested complex values, or throw error on their serialization attempts.
		let oldValue = (entity as any)[key];
		if (oldValue instanceof Set) {
			oldValue.clear();
			for (let x of value) {
				oldValue.add(x);
			}
		} else if (oldValue instanceof Map) {
			oldValue.clear();
			for (let [k,v] of Object.entries(value)) {
				oldValue.set(k,v);
			}
		} else (entity as any)[key] = structuredClone(value);
	}
	private deserializeEffectFields(effect: Effect<any>, input: EntityJson) {
		if (input.data) {
			this.enter("data");
			this.requireType(input.data, "object");
			try {
				(effect as Entity).loadCustomData?.(input.data);
			} catch (e) {
				this.error(e);
			}
			for (let [k, v] of Object.entries(input.data)) {
				this.deserializeValue(effect,k,v);
			}
			this.exit("data")
		}
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
		if (input.data) {
			this.enter("data");
			this.requireType(input.data, "object");
			try {
				(object as Entity).loadCustomData?.(input.data);
			} catch (e) {
				this.error(e);
			}
			for (let [k, v] of Object.entries(input.data)) {
				this.deserializeValue(object,k,v);
			}
			this.exit("data");
		}
		if (input.components) {
			this.enter("components")
			this.requireType(input.components, "array");
			for (let i = 0; i < input.components.length; i++) {
				this.enter(String(i));
				let component = this.deserialize(input.components[i]);
				if (!(component instanceof ObjectComponent)) {
					this.error(`Expected ObjectComponent, got ${component.clsid}`);
				}
				component.addTo(object);
				this.exit(String(i));
			}
			this.exit("components")
		}
		if (input.effects) {
			this.enter("effects")
			this.requireType(input.effects, "array");
			for (let i = 0; i < input.effects.length; i++) {
				this.enter(String(i));
				let effect = this.deserialize(input.effects[i]);
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
				this.requireType(entry,"array");
				if (entry.length !== 2) this.error(`Invalid child entry size ${entry.length}`);
				this.exit(String(i));
				let [pos,jchild] = entry;
				let spos = objectToString(pos);
				this.enter(spos);
				let child = this.deserialize(jchild);
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

	private requireType(value: any, type: string, key?: string) {
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

	error(e: any): never {
		if (e instanceof Error) throw new EntityLoaderError(this, e.message, e);
		throw new EntityLoaderError(this, objectToString(e));
	}
}


