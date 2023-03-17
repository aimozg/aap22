/*
 * Created by aimozg on 05.03.2023.
 */

import {objectToString, Type} from "../../utils/types";
import {Effect} from "./Effect";
import {Entity} from "./Entity";
import {ObjectComponent} from "./ObjectComponent";
import {GameEventMap, GameEventType} from "./GameEvent";
import {ObjectStat, StatId} from "./ObjectStat";
import {getOrPut} from "../../utils/collections";
import {initStatBaseValuesFromMetadata} from "./decorators";

export type ChildGameObject = [any, GameObject];

export abstract class GameObject extends Entity {
	protected constructor(
		clsid: string,
		bpid: string | null,
		uuid: number
	) {
		super(clsid, bpid, uuid);
		initStatBaseValuesFromMetadata(this);
	}

	name: string                                 = "GameObject";
	parentEntity: GameObject | null              = null;
	effects: Effect<this>[]                      = [];
	components: ObjectComponent<this>[]          = [];
	hookLists: Map<GameEventType, Entity[]> | null = null;
	stats: Map<StatId, ObjectStat>               = new Map();

	toString() {
		return `[${this.clsid}#${this.uuid}]`
	}

	// TODO @ChildObject
	saveChildren(): ChildGameObject[] {
		return []
	};

	loadChild(pos: any, child: GameObject): void {
		throw new Error(`Object ${this} cannot have child [${objectToString(pos)}, ${child}]`);
	}

	getStatObject(statId: StatId): ObjectStat {
		return getOrPut(this.stats, statId, () => new ObjectStat(this, statId, 0));
	}

	getStatValue(statId: StatId): number {
		return this.stats.get(statId)?.current ?? 0;
	}

	getStatBaseValue(statId: StatId): number {
		return this.stats.get(statId)?.base ?? 0;
	}

	setStatBaseValue(statId: StatId, value: number, runHooks: boolean = true) {
		this.getStatObject(statId).setBaseValue(value, runHooks);
	}

	addComponent(component: ObjectComponent<this>): void {
		if (component.parentEntity) throw new Error(`Component ${component} already attached to ${component.parentEntity}`);
		this.components.push(component);
		component.parentEntity = this;
		component.onAdd(this);
		if (component.hooks) Object.keys(component.hooks).forEach(type => {
			getOrPut(
				(this.hookLists ??= new Map()),
				type,
				()=>[]
			).push(component);
		});
	}

	findComponent<T extends ObjectComponent<this>>(klass: Type<T>): T | undefined {
		return this.components.find((c): c is T => c instanceof klass);
	}

	addEffect(effect: Effect<this>, runHooks:boolean=true): void {
		if (effect.parentEntity) throw new Error(`Effect ${effect} already attached to ${effect.parentEntity}`);
		effect.parentEntity = this;
		this.effects.push(effect);
		effect.onAdd?.(this);
		effect.stats?.forEach((value, stat) => {
			this.getStatObject(stat).addEffect(effect, runHooks)
		});
		if (effect.hooks) Object.keys(effect.hooks).forEach(type => {
			getOrPut(
				(this.hookLists ??= new Map()),
				type,
				()=>[]
			).push(effect);
		});
		// TODO attach hooks
	}

	removeEffect(effect: Effect<this>): boolean {
		if (this.effects.remove(effect)) {
			effect.parentEntity = null;
			effect.stats?.forEach((value,stat)=>{
				this.getStatObject(stat).removeEffect(effect);
			});
			if (effect.hooks) Object.keys(effect.hooks).forEach(type => {
				this.hookLists?.get(type as GameEventType)?.remove(effect);
			});
			effect.onRemove?.(this);
			return true;
		}
		return false;
	}

	dispatchEvent<T extends GameEventType>(type: T, event: GameEventMap[T]) {
		super.dispatchEvent(type, event);
		for (let hl of this.hookLists?.get(type)??[]) {
			hl.dispatchEvent(type, event);
		}
	}

	registerHook<T extends GameEventType>(type: T, handler: (event:GameEventMap[T])=>void){
		(this.hooks ??= {})[type] = handler;
	}

	/**
	 * Set parentEntity field to `obj`. No hooks will be called!
	 * @param obj
	 */
	setParentObject(obj: GameObject | null) {
		if (obj === this) throw new Error(`setParentObject called on self ${obj}`)
		this.parentEntity = obj;
	}
}


