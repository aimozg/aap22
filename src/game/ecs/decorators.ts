/*
 * Created by aimozg on 14.03.2023.
 */

import "reflect-metadata"
import {getMetadataOrPut} from "../../utils/types";
import {GameObject} from "./GameObject";
import {StatId} from "./ObjectStat";
import {Entity} from "./Entity";

/** type: Map<StatId, number> */
export let MetadataKeyStatBaseValues = Symbol("StatBaseValues");

export function RawStat(baseValue: number, statId?: StatId): PropertyDecorator {
	return (target: GameObject, propertyKey: StatId) => {
		statId ??= propertyKey;
		let baseValues = getMetadataOrPut(MetadataKeyStatBaseValues, target, () => new Map<StatId, number>());
		baseValues.set(statId, baseValue);
		Object.defineProperty(target, statId, {
			get(this: GameObject): any {
				return this.getStatBaseValue(statId!);
			},
			set(this: GameObject, v: number) {
				return this.setStatBaseValue(statId!, v);
			}
		});
	}
}
export function BuffableStat(baseValue: number, statId?: StatId): PropertyDecorator {
	return (target: GameObject, propertyKey: StatId) => {
		statId ??= propertyKey;
		let baseValues = getMetadataOrPut(MetadataKeyStatBaseValues, target, () => new Map<StatId, number>());
		baseValues.set(statId, baseValue);
		Object.defineProperty(target, statId, {
			get(this: GameObject): any {
				return this.getStatValue(statId!);
			}
		});
	}
}

export function initStatBaseValuesFromMetadata(object:GameObject) {
	let baseValues = Reflect.getMetadata(MetadataKeyStatBaseValues, object) as Map<StatId,number>|undefined;
	if (!baseValues) return;
	baseValues.forEach((value,key)=>{
		object.setStatBaseValue(key, value);
	});
}

/** type: string[] */
export let MetadataKeyEntityData = Symbol("EntityData");

export function EntityData(): PropertyDecorator {
	return (target: Entity, propertyKey:string) => {
		getMetadataOrPut<string[]>(MetadataKeyEntityData, target, ()=>[]).push(propertyKey);
	}
}

export function getEntityDataKeys(entity:Entity):string[] {
	return Reflect.getMetadata(MetadataKeyEntityData, entity) ?? []
}
export function getEntityDataEntries(entity:Entity):[string, any][] {
	return Reflect.getMetadata(MetadataKeyEntityData, entity)?.map((propertyName:string)=>
		[propertyName,(entity as any)[propertyName]]) ?? []
}
