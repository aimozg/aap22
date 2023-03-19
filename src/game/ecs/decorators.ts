/*
 * Created by aimozg on 14.03.2023.
 */

import "reflect-metadata"
import {getOwnMetadataOrPut} from "../../utils/types";
import {GameObject} from "./GameObject";
import {StatId, StatValues} from "./ObjectStat";
import {Entity} from "./Entity";
import {initStatBaseValues} from "./utils";

export function RawStat(statId?: StatId): PropertyDecorator {
	return (target: Object, propertyKey: StatId) => {
		statId ??= propertyKey;
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
export function BuffableStat(statId?: StatId): PropertyDecorator {
	return (target: Object, propertyKey: StatId) => {
		statId ??= propertyKey;
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

/** value = StatValues */
export let MetadataKeyStatBaseValues = Symbol("StatBaseValues");

export function StatBaseValues(stats:StatValues):ClassDecorator {
	return function(klass){
		// define metadata on the prototype, not on the class constructor
		let prototype = klass.prototype;
		let parentStats:StatValues =
			    Reflect.getMetadata(MetadataKeyStatBaseValues,prototype);
		Reflect.defineMetadata(MetadataKeyStatBaseValues, {
			...parentStats,
			...stats
		}, prototype);
	}
}

export function initStatBaseValuesFromMetadata(object:GameObject) {
	let stats = Reflect.getMetadata(MetadataKeyStatBaseValues, object) as StatValues|undefined;
	if (stats) {
		initStatBaseValues(object, stats);
	}
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

