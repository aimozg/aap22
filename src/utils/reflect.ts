/*
 * Created by aimozg on 28.03.2023.
 */

import "reflect-metadata";

/**
 * @return {} Prototype chain of object `o`, __excluding__ self
 */
export function prototypeChain(o:object): Object[] {
	let result:Object[] = [];
	while(true) {
		o = Object.getPrototypeOf(o);
		if (!o) break;
		result.push(o);
	}
	return result;
}

export function collectFromPrototypeChain<T>(o:object, collect:(prototype:Object)=>T[]):T[] {
	return prototypeChain(o).flatMap(proto=>collect(proto) ?? [])
}

export function collectMetadata<T>(o:object, metadataKey:any, propertyKey?:string|symbol):T[] {
	return collectFromPrototypeChain(o, proto=>Reflect.getOwnMetadata(metadataKey,proto));
}
