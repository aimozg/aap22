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
import {ObjectComponent} from "../ecs/ObjectComponent";

export enum ItemRarity {
	NORMAL,
	MAGICAL,
	RARE,
	UNIQUE
}
export let ItemRarityToColor:Record<ItemRarity,string> = {
	[ItemRarity.NORMAL]: Colors.BLACK,
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

export interface UsableDef {
	canUse?(this: Item, actor:Creature): boolean;
	onUse(this: Item, actor:Creature): void;
}

export interface ItemBlueprint {
	bpid: string;
	name: string;
	ch: string;
	color?: string;
	rarity?: ItemRarity;
	weapon?: WeaponDef;
	armor?: ArmorDef;
	usable?: UsableDef;
}

export class WeaponComponent extends ObjectComponent<Item> {
	static CLSID = "WeaponComponent"
	constructor(def:WeaponDef, uuid:number = UUID()) {
		super(WeaponComponent.CLSID, null, uuid);
		this.damage = def.damage;
	}
	damage: number;
}
export class ArmorComponent extends ObjectComponent<Item>{
	static CLSID = "ArmorComponent"
	constructor(def:ArmorDef, uuid:number = UUID()) {
		super(ArmorComponent.CLSID, null, uuid);
		this.defense = def.defense;
	}
	defense: number;
}
export class UsableComponent extends ObjectComponent<Item>{
	static CLSID = "UsableComponent"
	constructor(def: UsableDef, uuid:number = UUID()) {
		super(UsableComponent.CLSID, null, uuid);
		this._canUse = def.canUse ?? (()=>true);
		this._onUse = def.onUse;
	}
	private _canUse: (this:Item, actor: Creature)=>boolean;
	private _onUse: (this:Item, actor: Creature)=>void;
	canUse(actor:Creature):boolean {
		return this._canUse.call(this.parentEntity, actor);
	}
	use(actor:Creature):void {
		this._onUse.call(this.parentEntity, actor);
	}
}
export class Item extends GameObject {
	static readonly CLSID = "Item";
	constructor(blueprint: ItemBlueprint, uuid: number = UUID()) {
		super(Item.CLSID, blueprint.bpid, uuid);
		this.rarity = blueprint.rarity ?? ItemRarity.NORMAL;
		this.name = blueprint.name;
		this.glyph = {
			ch: blueprint.ch,
			fg: blueprint.color ?? Colors.LIGHTGRAY,
			stroke: ItemRarityToColor[this.rarity]
		};
		if (blueprint.weapon) new WeaponComponent(blueprint.weapon).addTo(this);
		if (blueprint.armor) new ArmorComponent(blueprint.armor).addTo(this);
		if (blueprint.usable) new UsableComponent(blueprint.usable).addTo(this);
	}

	rarity: ItemRarity;
	name: string;
	glyph: GlyphData;

	get weapon(): WeaponComponent|undefined { return this.findComponent(WeaponComponent) }
	get armor(): ArmorComponent|undefined { return this.findComponent(ArmorComponent) }
	get usable(): UsableComponent|undefined { return this.findComponent(UsableComponent) }

	get equipable():boolean {
		return !!this.weapon || !!this.armor;
	}
	equipped(host:Creature) {
		this.setParentObject(host);
	}
	unequipped() {
		this.setParentObject(null);
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
		this.name = item.name;
		item.setParentObject(this);
	}

	saveChildren(): ChildGameObject[] {
		return [[0,this.item]];
	}

	loadChild(pos: unknown, child: GameObject) {
		if (pos === 0 && child instanceof Item) {
			// already passed in the constructor
			return;
		}
		super.loadChild(pos, child);
	}

	z = MapObject.Z_ITEM;
	walkable: boolean = true;
	get glyph() { return this.item.glyph }
}
