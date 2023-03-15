/*
 * Created by aimozg on 13.03.2023.
 */

import {Effect} from "./Effect";

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
	update() {
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
	}
	addEffect(e:Effect<any>) {
		(this.effects ??= []).push(e);
		if (!this._dirty) {
			let value = e.stats?.get(this.id);
			if (value !== undefined) this._current = statAggregateFn(this.type)(this._current, value);
		}
	}
	removeEffect(e:Effect<any>) {
		this.effects?.remove(e);
		this.invalidate();
	}
	invalidate() {
		this._dirty = true;
	}
	setBaseValue(value:number) {
		this.base = value;
		this.invalidate();
	}
}
