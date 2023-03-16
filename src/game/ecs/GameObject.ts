/*
 * Created by aimozg on 05.03.2023.
 */

import {objectToString, Type} from "../../utils/types";
import {Effect} from "./Effect";
import {Entity} from "./Entity";
import {ObjectComponent} from "./ObjectComponent";
import {ObjectEventType} from "./ObjectEvent";
import {ObjectStat, StatId} from "./ObjectStat";
import {getOrPut} from "../../utils/collections";
import {initStatBaseValuesFromMetadata} from "./decorators";

export type ChildGameObject = [any, GameObject];

export abstract class GameObject extends Entity {
	protected constructor(
		clsid: string,
		bpid: string|null,
		uuid: number
	) {
		super(clsid, bpid, uuid);
		initStatBaseValuesFromMetadata(this);
	}
	name: string                  = "GameObject";
	parentEntity: GameObject|null = null;
	effects: Effect<this>[]       = [];
	components: ObjectComponent<this>[] = [];
	hooks: Map<ObjectEventType, Entity>|null = null;
	stats: Map<StatId, ObjectStat>           = new Map();
	toString() {
		return `[${this.clsid}#${this.uuid}]`
	}

	// TODO @ChildObject
	abstract saveChildren(): ChildGameObject[];
	loadChild(pos:any, child:GameObject):void {
		throw new Error(`Object ${this} cannot have child [${objectToString(pos)}, ${child}]`);
	}
	getStatValue(statId:StatId):number {
		return this.stats.get(statId)?.current ?? 0;
	}
	getStatBaseValue(statId:StatId):number {
		return this.stats.get(statId)?.base ?? 0;
	}
	setStatBaseValue(statId:StatId, value:number, runHooks:boolean=true) {
		// TODO run hooks
		getOrPut(this.stats, statId, ()=>new ObjectStat(statId,value)).setBaseValue(value);
	}
	findComponent<T extends ObjectComponent<this>>(klass:Type<T>):T|undefined {
		return this.components.find((c):c is T => c instanceof klass);
	}
	setParentObject(obj:GameObject|null) {
		if (obj === this) throw new Error(`setParentObject called on self ${obj}`)
		this.parentEntity = obj;
	}
}


