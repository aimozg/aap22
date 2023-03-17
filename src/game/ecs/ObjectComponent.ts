/*
 * Created by aimozg on 13.03.2023.
 */

import {GameObject} from "./GameObject";

export class ObjectComponent<HOST extends GameObject> extends GameObject {
	parentEntity: HOST;

	onAdd(host:HOST):void {}

	protected constructor(
		clsid: string,
		bpid: string|null,
		uuid: number
	) {
		super(clsid, bpid, uuid);
	}

	addTo(host:HOST) {
		host.addComponent(this);
	}


}
