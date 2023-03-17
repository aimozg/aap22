/*
 * Created by aimozg on 14.03.2023.
 */

import "reflect-metadata"
import {getOwnMetadataOrPut} from "../../utils/types";
import {GameObject} from "./GameObject";
import {StatId} from "./ObjectStat";
import {Entity} from "./Entity";

/** type: Map<StatId, number> */
export let MetadataKeyStatBaseValues = Symbol("StatBaseValues");

export function RawStat(baseValue: number, statId?: StatId): PropertyDecorator {
	return (target: Object, propertyKey: StatId) => {
		statId ??= propertyKey;
		let baseValues = getOwnMetadataOrPut(MetadataKeyStatBaseValues, target, () => new Map<StatId, number>());
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
	return (target: Object, propertyKey: StatId) => {
		statId ??= propertyKey;
		let baseValues = getOwnMetadataOrPut(MetadataKeyStatBaseValues, target, () => new Map<StatId, number>());
		baseValues.set(statId, baseValue);
		Object.defineProperty(target, statId, {
			get(this: GameObject): any {
				return this.getStatValue(statId!);
			},
			set() {
				throw new Error(`Property ${statId} is readonly, as it is a BuffableStat`);
			}
		});
	}
}

export function initStatBaseValuesFromMetadata(object:GameObject) {
	let baseValues = Reflect.getOwnMetadata(MetadataKeyStatBaseValues, object) as Map<StatId,number>|undefined;
	if (!baseValues) return;
	baseValues.forEach((value,key)=>{
		object.setStatBaseValue(key, value, false);
	});
}

export interface EntityDataDescriptor {
	/** Field/property name in the Entity */
	field:string;
	/** Key in serialized data */
	name:string;
	type:"clone"|"reference";
}
/** type: EntityDataDescriptor[] */
export let MetadataKeyEntityData = Symbol("EntityData");

export function EntityData(serializedName?:string): PropertyDecorator {
	return (target: Object, propertyKey:string) => {
		let descriptor:EntityDataDescriptor = {
			field: propertyKey,
			name: serializedName ?? propertyKey,
			type: "clone"
		}
		getOwnMetadataOrPut<EntityDataDescriptor[]>(MetadataKeyEntityData, target, ()=>[]).push(descriptor);
	}
}
export function EntityReference(serializedName?:string): PropertyDecorator {
	return (target: Object, propertyKey:string) => {
		let descriptor:EntityDataDescriptor = {
			field: propertyKey,
			name: serializedName ?? propertyKey,
			type: "reference"
		}
		getOwnMetadataOrPut<EntityDataDescriptor[]>(MetadataKeyEntityData, target, ()=>[]).push(descriptor);
	}
}

export function getEntityDataDescriptors(entity:Entity):EntityDataDescriptor[] {
	return Reflect.getOwnMetadata(MetadataKeyEntityData, entity) ?? []
}

