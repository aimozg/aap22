/*
 * Created by aimozg on 03.08.2022.
 */

import "reflect-metadata"

export type KeysOfType<OBJ, TYPE> = keyof {
	[P in keyof OBJ as OBJ[P] extends TYPE? P: never]: any
}

export type PartialRecord<K extends keyof any, T> =  Partial<Record<K, T>>

export type ReadonlyRecord<K extends keyof any, T> = Readonly<Record<K, T>>

export interface Type<T> extends Function { new (...args: any[]): T; }

const PlainObjectPrototype = Object.getPrototypeOf({});
export function isPlainObject(o:any):boolean {
	return o !== null && typeof o === "object" && Object.getPrototypeOf(o) === PlainObjectPrototype;
}

export function objectClassName(o:any) {
	if (typeof o === "object" && o) {
		return Object.getPrototypeOf(o).constructor.name
	}
	return typeof o
}

export function getMetadataOrPut<T>(metadataKey:any, target:Object, defaultMetadataProvider:(target:Object)=>T):T {
	if (Reflect.hasMetadata(metadataKey, target)) return Reflect.getMetadata(metadataKey, target);
	let value = defaultMetadataProvider(target);
	Reflect.defineMetadata(metadataKey, value, target);
	return value;
}

export function getOwnMetadataOrPut<T>(metadataKey:any, target:Object, defaultMetadataProvider:(target:Object)=>T):T {
	if (Reflect.hasOwnMetadata(metadataKey, target)) return Reflect.getOwnMetadata(metadataKey, target);
	let value = defaultMetadataProvider(target);
	Reflect.defineMetadata(metadataKey, value, target);
	return value;
}

export function objectToString(x:any):string {
	let s = String(x);
	if (s === "[object Object]") {
		try { s = JSON.stringify(x) } catch (ignored){}
	}
	return s;
}
