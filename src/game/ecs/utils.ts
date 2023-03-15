/*
 * Created by aimozg on 13.03.2023.
 */

import {StatId} from "./ObjectStat";
import {GameObject} from "./GameObject";

let uuidCounter = 1;

export function UUID():number {
	return uuidCounter++;
}
export function setUuidCounter(value:number) {
	uuidCounter = value;
}

export function setObjectBaseValues(target:GameObject, values:Partial<Record<StatId,number>>) {
	for (let [k,v] of Object.entries(values)) {
		target.setStatBaseValue(k as StatId,v);
	}
}

