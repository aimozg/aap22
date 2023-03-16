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
	return (target: Entity, propertyKey:string) => {
		let descriptor:EntityDataDescriptor = {
			field: propertyKey,
			name: serializedName ?? propertyKey,
			type: "clone"
		}
		getMetadataOrPut<EntityDataDescriptor[]>(MetadataKeyEntityData, target, ()=>[]).push(descriptor);
	}
}
export function EntityReference(serializedName?:string): PropertyDecorator {
	return (target: Entity, propertyKey:string) => {
		let descriptor:EntityDataDescriptor = {
			field: propertyKey,
			name: serializedName ?? propertyKey,
			type: "reference"
		}
		getMetadataOrPut<EntityDataDescriptor[]>(MetadataKeyEntityData, target, ()=>[]).push(descriptor);
	}
}

export function getEntityDataDescriptors(entity:Entity):EntityDataDescriptor[] {
	return Reflect.getMetadata(MetadataKeyEntityData, entity) ?? []
}

