/*
 * Created by aimozg on 13.03.2023.
 */

import {ChildGameObject, GameObject} from "./GameObject";

export class ObjectComponent<HOST extends GameObject> extends GameObject {
	host: HOST;

	onAdd(host:HOST):void {}

	protected constructor(
		clsid: string,
		bpid: string|null,
		uuid: number
	) {
		super(clsid, bpid, uuid);
	}

	addTo(host:HOST) {
		if (this.host) throw new Error(`Component ${this} already attached to ${this.host}`);
		host.components.push(this);
		this.host = host;
		this.onAdd(host);
		// TODO apply effects and stats
	}

	saveChildren(): ChildGameObject[] {
		return [];
	}


}
