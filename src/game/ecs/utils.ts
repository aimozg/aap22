/*
 * Created by aimozg on 13.03.2023.
 */

import {StatId} from "./ObjectStat";
import {GameObject} from "./GameObject";

export function UUID():number {
	return UUID.counter++;
}
UUID.counter = 1;

export function initObjectBaseValues(target:GameObject, values:Partial<Record<StatId,number>>) {
	for (let [k,v] of Object.entries(values)) {
		target.setStatBaseValue(k as StatId,v,false);
	}
}

