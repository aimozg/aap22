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

export class WeaponComponent {
	constructor(public item:Item, def:WeaponDef) {
		this.damage = def.damage;
	}
	damage: number;
}
export class ArmorComponent {
	constructor(public item:Item, def:ArmorDef) {
		this.defense = def.defense;
	}
	defense: number;
}
export class UsableComponent {
	constructor(public item:Item, def: UsableDef) {
		this._canUse = def.canUse ?? (()=>true);
		this._onUse = def.onUse;
	}
	private _canUse: (this:Item, actor: Creature)=>boolean;
	private _onUse: (this:Item, actor: Creature)=>void;
	canUse(actor:Creature):boolean {
		return this._canUse.call(this.item, actor);
	}
	use(actor:Creature):void {
		this._onUse.call(this.item, actor);
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
		this.weapon = blueprint.weapon ? new WeaponComponent(this, blueprint.weapon) : null;
		this.armor = blueprint.armor ? new ArmorComponent(this, blueprint.armor) : null;
		this.usable = blueprint.usable ? new UsableComponent(this, blueprint.usable) : null;
	}

	rarity: ItemRarity;
	name: string;
	glyph: GlyphData;

	weapon: WeaponComponent|null;
	armor: ArmorComponent|null;
	usable: UsableComponent|null;

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

	loadChild(pos: any, child: GameObject) {
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
