import {GameObject} from "./GameObject";
import {Entity} from "./Entity";
import {StatId} from "./ObjectStat";

export abstract class Effect<E extends GameObject> implements Entity {
	parentEntity: E | null           = null;
	stats: Map<StatId,number> | null = null;
	// TODO hooks

	protected constructor(
		public readonly clsid: string,
		public readonly bpid: string|null,
		public readonly uuid: number
	) {
	}

	toString() {
		return `[${this.clsid}#${this.uuid} @${this.parentEntity}]`
	}
	addTo(target:E) {
		if (this.parentEntity) throw new Error(`Effect ${this} already added`);
		this.parentEntity = target;
		target.effects.push(this);
		// TODO call onAdd
		// TODO copy stats
		// TODO add hooks
	}
}
