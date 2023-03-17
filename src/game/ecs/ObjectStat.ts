/*
 * Created by aimozg on 13.03.2023.
 */

import {Effect} from "./Effect";
import {GameObject} from "./GameObject";

export interface ObjectStatNames {
	hp: number;
}

export type StatId = keyof ObjectStatNames;

export const enum StatAggregateType {
	SUM,
	PRODUCT,
	MIN,
	MAX
}
export function statAggregateFn(type:StatAggregateType):(a:number, b:number)=>number {
	switch (type) {
		case StatAggregateType.SUM:
			return (a,b)=>a+b;
		case StatAggregateType.PRODUCT:
			return (a,b)=>a*b;
		case StatAggregateType.MIN:
			return Math.min;
		case StatAggregateType.MAX:
			return Math.max;
	}
}

export class ObjectStat {
	constructor(
		public host: GameObject,
		public id: StatId,
		public base: number = 0,
		public readonly type: StatAggregateType = StatAggregateType.SUM
	) {
		this._current = base;
	}
	effects?: Effect<any>[]
	private _current: number;
	private _dirty: boolean = false;
	get current():number {
		if (this._dirty) this.update();
		return this._current;
	}
	update(runHooks:boolean=true) {
		let oldCurrent = this._current;
		let current = this.base;
		if (this.effects) {
			let aggregate = statAggregateFn(this.type);
			for (let effect of this.effects) {
				let value = effect.stats?.get(this.id);
				if (value !== undefined) current = aggregate(current, value)
			}
		}
		this._current = current;
		this._dirty = false;
		if (runHooks && current !== oldCurrent) {
			let event = {
				object: this.host,
				stat: this.id,
				oldValue: oldCurrent,
				newValue: current
			};
			this.host.dispatchEvent("onStatChange", event);
			this.host.dispatchEvent(`onStatChange_${this.id}`, event);
		}
	}
	addEffect(e:Effect<any>, runHooks:boolean=true) {
		(this.effects ??= []).push(e);
		this.update(runHooks)
	}
	removeEffect(e:Effect<any>, runHooks:boolean=true) {
		this.effects?.remove(e);
		this.update(runHooks);
	}
	setBaseValue(value:number, runHooks:boolean=true) {
		this.base = value;
		this.update(runHooks);
	}
}
