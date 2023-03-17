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
	addTo(host:E):void {
		host.addEffect(this);
	}
	remove():void {
		this.parentEntity?.removeEffect(this);
	}
	onAdd?(host:E):void;
	onRemove?(host:E):void;
}
