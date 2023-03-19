import {initStatBaseValues, UUID} from "../ecs/utils";
import {ObjectComponent} from "../ecs/ObjectComponent";
import {Creature, CreatureStatId, CreatureTag} from "./Creature";
import {BlueprintClassLoader} from "../ecs/EntityClassLoader";
import {EntityJson, EntityLoader} from "../ecs/EntityLoader";

export interface MonsterBlueprint {
	bpid: string;
	name: string;
	ch: string;
	color: string;
	tags?: CreatureTag[];

	stats: Partial<Record<CreatureStatId,number>>;
}

export class Monster extends Creature {

	static readonly CLSID = "Monster";

	constructor(blueprint: MonsterBlueprint,
	            uuid: number = UUID(),
	            ...components: ObjectComponent<Creature>[]) {
		super(Monster.CLSID, blueprint.bpid, uuid, ...components);
		this.name = blueprint.name;
		this.color = blueprint.color;
		this.glyph.ch = blueprint.ch;
		this.glyph.fg = blueprint.color;
		if (blueprint.tags) for (let tag of blueprint.tags) this.tags.add(tag);
		initStatBaseValues(this, blueprint.stats);
		this.setStatBaseValue("hp", this.hpMax, false);
	}
	static Loader = new class extends BlueprintClassLoader<Monster,MonsterBlueprint> {
		constructor() {super(Monster.CLSID);}

		createFromBlueprint(ctx: EntityLoader, bp: MonsterBlueprint, uuid: number, e: EntityJson): Monster {
			return new Monster(bp, uuid);
		}

	}
}
