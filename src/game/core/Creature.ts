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
	dodge: number;
}

export class Creature extends MapObject {
	constructor(
		proto: CreaturePrototype,
		...effects: EntityEffect<Creature>[]
	) {
		super();
		this.name  = proto.name;
		this.glyph = {
			ch: proto.ch,
			// TODO blink if has special condition
			fg: tinycolor(proto.color)
		}
		this.hp = proto.hp;
		this.hpMax = proto.hp;
		this.aim = proto.aim;
		this.dodge = proto.dodge;

		for (let effect of effects) {
			effect.addTo(this);
		}
	}

	z = MapObject.Z_CREATURE;
	glyph: GlyphData;
	name: string;
	walkable = false;

	//-------//
	// STATS //
	//-------//

	ap = 0;
	speed = 4;
	hp = 1;
	hpMax = 1;
	aim = 0;
	dodge = 0;

	//---------//
	// HELPERS //
	//---------//

	canAct():boolean {
		return this.ap >= this.speed;
	}
}

