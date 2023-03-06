/*
 * Created by aimozg on 03.08.2022.
 */

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

