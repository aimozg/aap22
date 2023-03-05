/*
 * Created by aimozg on 05.03.2023.
 */

export class MultiMap<K,V> {
	constructor() {}

	#map = new Map<K,V[]>();
	#count = 0;

	private list(key:K):V[] {
		let x = this.#map.get(key);
		if (!x) {
			x = [];
			this.#map.set(key, x);
		}
		return x;
	}

	set(key:K, value:V) {
		this.list(key).push(value);
		this.#count++;
	}
	first(key:K):V|undefined {
		return this.#map.get(key)?.[0];
	}
	/** The returned list should not be modified */
	get(key:K):V[] {
		return this.#map.get(key) ?? [];
	}
	size():number {
		return this.#count;
	}
	delete(key:K, value:V):boolean {
		let list = this.#map.get(key);
		if (!list) return false;
		if (list.remove(value)) {
			this.#count--;
			return true;
		}
		return false;
	}
	deleteAll(key:K):number {
		let list = this.#map.get(key);
		if (!list) return 0;
		this.#count -= list.length;
		this.#map.delete(key);
		return list.length;
	}
	clear() {
		this.#map.clear();
		this.#count = 0;
	}
	keys(): IterableIterator<K> {
		return this.#map.keys();
	}
	values(): V[] {
		return Array.from(this.#map.values()).flatMap(x=>x);
	}
	entries(): [K,V][] {
		return Array.from(this.#map.entries()).flatMap(([k,vs])=>
			vs.map(v=>[k,v] as [K,V]));
	}
	forEach<THISARG>(callback:(this:THISARG, value:V, key:K, map:MultiMap<K,V>)=>void, thisarg?:THISARG) {
		this.#map.forEach((values,key)=>{
			values.forEach(value=>callback.call(thisarg, value, key, this));
		})
	}
}
