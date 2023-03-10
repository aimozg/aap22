import {MapObject} from "./MapObject";
import {GlyphData} from "../ui/GlyphLayer";
import * as tinycolor from "tinycolor2";
import {EntityEffect} from "../Entity";
import {coerce} from "../../utils/math/utils";
import {Item} from "./Item";

export type CreatureTag =
	"player"|"boss"|
	"undead"|"beast"|"demon"|"construct"|"humanoid"|
	"bones";

export interface CreaturePrototype {
	name: string;
	ch: string;
	color: string;
	tags?: CreatureTag[];

	level: number;
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
		this.level  = proto.level;
		this.hp     = proto.hp;
		this.hpMax         = proto.hp;
		this.naturalAim    = proto.aim;
		this.naturalDamage = proto.damage;
		this.naturalDodge  = proto.dodge;
		this.speed         = proto.speed;

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

	level: number;
	ap: number = 0;
	speed: number;
	hp: number;
	hpMax: number;
	naturalAim: number;
	naturalDamage: number;
	naturalDodge: number;

	//-------//
	// ITEMS //
	//-------//

	weapon: Item|null;
	armor: Item|null;
	inventory: (Item|null)[];

	//---------//
	// HELPERS //
	//---------//

	get aim(): number {
		return this.naturalAim
	}
	get damage(): number {
		return this.weapon?.weapon?.damage ?? this.naturalDamage;
	}
	get dodge(): number {
		return this.naturalDodge
	}

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

	//-----------//
	// MODIFIERS //
	//-----------//

	setWeapon(weapon:Item|null) {
		if (weapon && !weapon.weapon) throw new Error(`Item ${weapon} is not a weapon`);
		this.weapon?.unequipped();
		this.weapon = weapon;
		weapon?.equipped(this);
	}
}

