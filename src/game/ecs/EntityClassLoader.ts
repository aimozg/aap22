import {Entity} from "./Entity";
import {EntityJson, EntityLoader} from "./EntityLoader";

export interface EntityClassLoader<ENTITY extends Entity> {
	clsid: string;

	create(e: EntityJson, ctx: EntityLoader): ENTITY;
}

export class SimpleClassLoader<ENTITY extends Entity> implements EntityClassLoader<ENTITY> {
	constructor(
		public readonly clsid: string,
		public create: (e:EntityJson, ctx: EntityLoader)=>ENTITY
	) {}
}

export abstract class BlueprintClassLoader<ENTITY extends Entity, BLUEPRINT extends {bpid:string}> implements EntityClassLoader<ENTITY>{
	protected constructor(public clsid: string) {}
	protected blueprints = new Map<string, BLUEPRINT>();

	registerBlueprint(blueprint:BLUEPRINT) {
		this.blueprints.set(blueprint.bpid, blueprint);
	}
	registerBlueprints(blueprints:BLUEPRINT[]) {
		for (let bp of blueprints) {
			this.registerBlueprint(bp);
		}
	}

	abstract createFromBlueprint(ctx: EntityLoader, bp: BLUEPRINT, uuid: number, e: EntityJson): ENTITY;

	create(e: EntityJson, ctx: EntityLoader): ENTITY {
		let bp = e.bpid ? this.blueprints.get(e.bpid) : undefined;
		if (!bp) ctx.error(`unknown blueprint '${e.bpid}' for class '${this.clsid}'`)
		return this.createFromBlueprint(ctx, bp, e.uuid, e);
	}

}
