/*
 * Created by aimozg on 10.03.2023.
 */

import {ChildGameObject, GameObject} from "../ecs/GameObject";
import {GlyphData} from "../../utils/ui/GlyphLayer";
import {MapObject} from "./MapObject";
import {Colors} from "../../utils/ui/canvas";
import {Creature} from "./Creature";
import {UUID} from "../ecs/utils";
import {BlueprintClassLoader} from "../ecs/EntityClassLoader";
import {EntityJson, EntityLoader} from "../ecs/EntityLoader";

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

export interface ItemBlueprint {
	bpid: string;
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
export class Item extends GameObject {
	static readonly CLSID = "Item";
	constructor(blueprint: ItemBlueprint, uuid: number = UUID()) {
		super(Item.CLSID, blueprint.bpid, uuid);
		this.rarity = blueprint.rarity ?? ItemRarity.NORMAL;
		this.name = blueprint.name;
		this.glyph = {
			ch: blueprint.ch,
			fg: ItemRarityToColor[this.rarity]
		};
		this.weapon = blueprint.weapon ? new WeaponComponent(blueprint.weapon) : null;
		this.armor = blueprint.armor ? new ArmorComponent(blueprint.armor) : null;
	}

	rarity: ItemRarity;
	name: string;
	glyph: GlyphData;

	weapon: WeaponComponent|null;
	armor: ArmorComponent|null;

	equipped(host:Creature) {
		this.setParentObject(host);
	}
	unequipped() {
		this.setParentObject(null);
	}

	saveChildren(): ChildGameObject[] {
		return [];
	}

	static Loader = new class extends BlueprintClassLoader<Item, ItemBlueprint> {
		createFromBlueprint(ctx: EntityLoader, bp: ItemBlueprint, uuid: number, e: EntityJson): Item {
			return new Item(bp, uuid);
		}
		constructor() {super(Item.CLSID);}
	}
}

export class DroppedItem extends MapObject {
	constructor(public item: Item,
	            uuid: number = UUID()) {
		super("DroppedItem", null, uuid);
		item.setParentObject(this);
	}

	saveChildren(): ChildGameObject[] {
		return [[0,this.item]];
	}

	z = MapObject.Z_ITEM;
	walkable: boolean = true;
	get name() { return this.item.name }
	get glyph() { return this.item.glyph }
}
