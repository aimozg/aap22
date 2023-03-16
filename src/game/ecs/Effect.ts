import {GameObject} from "./GameObject";
import {Entity} from "./Entity";
import {StatId} from "./ObjectStat";

export class Effect<E extends GameObject> extends Entity {
	parentEntity: E | null           = null;
	stats: Map<StatId,number> | null = null;
	// TODO hooks

	constructor(clsid: string, bpid: string | null, uuid: number) {
		super(clsid, bpid, uuid);
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
