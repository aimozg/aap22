/*
 * Created by aimozg on 03.08.2022.
 */

import "reflect-metadata"

export type KeysOfType<OBJ, TYPE> = keyof {
	[P in keyof OBJ as OBJ[P] extends TYPE? P: never]: unknown
}

export type PartialRecord<K extends keyof unknown, T> =  Partial<Record<K, T>>

export type ReadonlyRecord<K extends keyof unknown, T> = Readonly<Record<K, T>>

// export interface Type<T> extends Function { new (...args: unknown[]): T; }
export type Type<T> = Function & { prototype: T; } | Function & { new (...args: unknown[]): T; }

const PlainObjectPrototype = Object.getPrototypeOf({});
export function isPlainObject(o:unknown):boolean {
	return o !== null && typeof o === "object" && Object.getPrototypeOf(o) === PlainObjectPrototype;
}

export function objectClassName(o:unknown) {
	if (typeof o === "object" && o) {
		return Object.getPrototypeOf(o).constructor.name
	}
	return typeof o
}

export function getMetadataOrPut<T>(metadataKey:unknown, target:Object, defaultMetadataProvider:(target:Object)=>T):T {
	if (Reflect.hasMetadata(metadataKey, target)) return Reflect.getMetadata(metadataKey, target);
	let value = defaultMetadataProvider(target);
	Reflect.defineMetadata(metadataKey, value, target);
	return value;
}

export function getOwnMetadataOrPut<T>(metadataKey:unknown, target:Object, defaultMetadataProvider:(target:Object)=>T, propertyKey?: string|symbol):T {
	if (propertyKey !== undefined) {
		if (Reflect.hasOwnMetadata(metadataKey, target, propertyKey)) return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
	} else {
		if (Reflect.hasOwnMetadata(metadataKey, target)) return Reflect.getOwnMetadata(metadataKey, target);
	}
	let value = defaultMetadataProvider(target);
	if (propertyKey !== undefined) {
		Reflect.defineMetadata(metadataKey, value, target, propertyKey);
	} else {
		Reflect.defineMetadata(metadataKey, value, target);
	}
	return value;
}

export function objectToString(x:unknown):string {
	let s = String(x);
	if (s === "[object Object]") {
		try { s = JSON.stringify(x) } catch (ignored){}
	}
	return s;
}
