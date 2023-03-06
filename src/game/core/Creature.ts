import {MapObject} from "./MapObject";
import {GlyphData} from "../ui/GlyphLayer";
import * as tinycolor from "tinycolor2";
import {EntityEffect} from "../Entity";

export interface CreaturePrototype {
	name: string;
	ch: string;
	color: string;

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
		this.hp     = proto.hp;
		this.hpMax  = proto.hp;
		this.aim    = proto.aim;
		this.damage = proto.damage;
		this.dodge  = proto.dodge;

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

	//-------//
	// STATS //
	//-------//

	ap     = 0;
	speed  = 4;
	hp     = 1;
	hpMax  = 1;
	aim    = 0;
	damage = 0;
	dodge  = 0;

	//---------//
	// HELPERS //
	//---------//

	canAct(): boolean {
		return this.ap >= this.speed;
	}

	isHostileTo(other: Creature) {
		if (other === this) return false;
		return other.faction !== this.faction;
	}
}

