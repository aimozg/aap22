/*
 * Created by aimozg on 10.03.2023.
 */

import {Entity} from "../Entity";
import {GlyphData} from "../../utils/ui/GlyphLayer";
import {MapObject} from "./MapObject";
import {Colors} from "../../utils/ui/canvas";
import {Creature} from "./Creature";

export enum ItemRarity {
	NORMAL,
	MAGICAL,
	RARE,
	UNIQUE
}
export let ItemRarityToColor:Record<ItemRarity,string> = {
	[ItemRarity.NORMAL]: Colors.WHITE,
	[ItemRarity.MAGICAL]: Colors.BLUE,
	[ItemRarity.RARE]: Colors.GREEN,
	[ItemRarity.UNIQUE]: Colors.ORANGE,

}

export interface WeaponDef {
	damage: number;
}

export interface ArmorDef {
	defense: number;
}

export interface ItemDef {
	name: string;
	ch: string;
	rarity?: ItemRarity;
	weapon?: WeaponDef;
	armor?: ArmorDef;
}

export class WeaponComponent {
	constructor(def:WeaponDef) {
		this.damage = def.damage;
	}
	damage: number;
}
export class ArmorComponent {
	constructor(def:ArmorDef) {
		this.defense = def.defense;
	}
	defense: number;
}
export class Item extends Entity {
	constructor(def: ItemDef) {
		super();
		this.rarity = def.rarity ?? ItemRarity.NORMAL;
		this.name = def.name;
		this.glyph = {
			ch: def.ch,
			fg: ItemRarityToColor[this.rarity]
		};
		this.weapon = def.weapon ? new WeaponComponent(def.weapon) : null;
		this.armor = def.armor ? new ArmorComponent(def.armor) : null;
	}

	rarity: ItemRarity;
	name: string;
	glyph: GlyphData;

	weapon: WeaponComponent|null;
	armor: ArmorComponent|null;

	equipped(host:Creature) {
		this.setParent(host);
	}
	unequipped() {
		this.setParent(null);
	}
}

export class DroppedItem extends MapObject {
	constructor(public item: Item) {
		super();
		item.setParent(this);
	}

	z = MapObject.Z_ITEM;
	walkable: boolean = true;
	get name() { return this.item.name }
	get glyph() { return this.item.glyph }
}
