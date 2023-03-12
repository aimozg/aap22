/*
 * Created by aimozg on 21.07.2022.
 */

export function createArray<T>(size:number, initializer: (i:number, array:T[])=>T):T[] {
	let arr = Array<T>(size);
	for (let i = 0; i < size; i++) arr[i] = initializer(i, arr);
	return arr;
}
export function createRecord<K extends PropertyKey,V>(pairs:[K,V][]):Record<K,V> {
	let result = {} as Record<K,V>;
	for (let [k,v] of pairs) result[k] = v;
	return result;
}

export function obj2map<K extends PropertyKey,V>(obj:{
	[index in K]?:V
}):Map<K,V> {
	return pairs2map(Object.entries(obj) as [K,V][]);
}

export function pairs2map<K extends PropertyKey,V>(pairs:[K,V][]):Map<K,V> {
	let map = new Map<K,V>();
	for (let [k,v] of pairs) {
		map.set(k,v);
	}
	return map;
}

export function getOrPut<K,V>(map:Map<K,V>, key:K, provider:(key:K)=>V): V {
	if (map.has(key)) return map.get(key)!;
	let value = provider(key);
	map.set(key, value);
	return value;
}
