import {MapObject} from "./MapObject";
import {GlyphData} from "../../utils/ui/GlyphLayer";
import {coerce} from "../../utils/math/utils";
import {Item} from "./Item";
import {ObjectComponent} from "../ecs/ObjectComponent";
import {ChildGameObject, GameObject} from "../ecs/GameObject";
import {BaseStats, BuffableStat, EntityData, RawStat} from "../ecs/decorators";

export interface CreatureStatNames {
	level: number;
	ap: number;
	hp: number;
	hpMax: number;
	naturalAim: number;
	naturalDodge: number;
	naturalDamage: number;
	speed: number;
}
export type CreatureStatId = keyof CreatureStatNames;

declare module "../ecs/ObjectStat" {
	export interface ObjectStatNames extends CreatureStatNames {}
}

export type CreatureTag =
	"player"|"boss"|
	"undead"|"beast"|"demon"|"construct"|"humanoid"|
	"bones";

@BaseStats({
	level: 1,
	ap: 0,
	hp: 1,
	hpMax: 1,
	naturalAim: 50,
	naturalDodge: 0,
	naturalDamage: 1,
	speed: 4
})
export abstract class Creature extends MapObject {
	protected constructor(
		clsid: string,
		bpid: string|null,
		uuid: number,
		...components: ObjectComponent<Creature>[]
	) {
		super(clsid, bpid, uuid);
		for (let component of components) {
			component.addTo(this);
		}
	}

	saveChildren(): ChildGameObject[] {
		let result: ChildGameObject[] = [];
		if (this.weapon) result.push(["eq-weapon",this.weapon]);
		if (this.armor) result.push(["eq-armor",this.armor]);
		this.inventory.forEach((item,index)=>{
			if (item) result.push(["inv-"+index,item]);
		})
		return result;
	}
	loadChild(pos: string, child: GameObject) {
		pos = String(pos);
		if (child instanceof Item) {
			if (pos === "eq-weapon") {
				// TODO silently
				this.setWeapon(child);
				return;
			}
			if (pos === "eq-armor") {
				// TODO silently
				this.setArmor(child);
				return;
			}
			let inv = pos.match(/^inv-(\d+)$/);
			if (inv) {
				this.inventory[parseInt(inv[1])] = child;
				return;
			}
		}
		super.loadChild(pos, child);
	}

	@EntityData()
	name: string;
	color: string;
	glyph: GlyphData = {ch: '@', fg: '#ffffff', stroke:'#000000'};
	z               = MapObject.Z_CREATURE;
	walkable        = false;
	@EntityData()
	faction: string = "monster";
	@EntityData()
	tags: Set<CreatureTag> = new Set();

	//-------//
	// STATS //
	//-------//

	@RawStat()
	level: number;
	@RawStat()
	ap: number;
	@BuffableStat()
	readonly speed: number;
	@RawStat()
	hp: number;
	@BuffableStat()
	readonly hpMax: number;
	@BuffableStat()
	readonly naturalAim: number;
	@BuffableStat()
	readonly naturalDamage: number;
	@BuffableStat()
	readonly naturalDodge: number;

	//-------//
	// ITEMS //
	//-------//

	weapon: Item|null;
	armor: Item|null;
	inventory: (Item|null)[] = [];

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
	setArmor(armor:Item|null) {
		if (armor && !armor.armor) throw new Error(`Item ${armor} is not an armor`);
		this.armor?.unequipped();
		this.armor = armor;
		armor?.equipped(this);
	}
	addItem(item:Item):boolean {
		// TODO inventory size
		this.inventory.push(item);
		return true;
	}
	removeItem(item:Item):boolean {
		return this.inventory.remove(item);
	}
}

