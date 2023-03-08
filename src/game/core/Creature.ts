import {MapObject} from "./MapObject";
import {GlyphData} from "../ui/GlyphLayer";
import * as tinycolor from "tinycolor2";
import {EntityEffect} from "../Entity";
import {coerce} from "../../utils/math/utils";

export type CreatureTag =
	"player"|"boss"|
	"undead"|"beast"|"demon"|"construct"|"humanoid"|
	"bones";

export interface CreaturePrototype {
	name: string;
	ch: string;
	color: string;
	tags?: CreatureTag[];

	speed: number;
	hp: number;
	aim: number;
	damage: number;
	dodge: number;
}

export class Creature extends MapObject {
	constructor(
		proto: CreaturePrototype,
		...effects: EntityEffect<Creature>[]
	) {
		super();
		this.name   = proto.name;
		this.color  = proto.color;
		this.glyph  = {
			ch: proto.ch,
			// TODO blink if has special condition
			fg: tinycolor(this.color)
		}
		this.tags = new Set(proto.tags);
		this.hp     = proto.hp;
		this.hpMax  = proto.hp;
		this.aim    = proto.aim;
		this.damage = proto.damage;
		this.dodge  = proto.dodge;
		this.speed  = proto.speed;

		for (let effect of effects) {
			effect.addTo(this);
		}
	}

	name: string;
	color: string;
	glyph: GlyphData;
	z               = MapObject.Z_CREATURE;
	walkable        = false;
	faction: string = "monster";
	tags: Set<CreatureTag>;

	//-------//
	// STATS //
	//-------//

	ap: number = 0;
	speed: number;
	hp: number;
	hpMax: number;
	aim: number;
	damage: number;
	dodge: number;

	//---------//
	// HELPERS //
	//---------//

	get apPerAction():number {
		return coerce(1, 8-this.speed, 8);
	}
	canAct(): boolean {
		return this.ap >= this.apPerAction;
	}
	get isAlive():boolean {
		return this.hp > 0;
	}

	isHostileTo(other: Creature) {
		if (other === this) return false;
		return other.faction !== this.faction;
	}
}

