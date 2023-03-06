/*
 * Created by aimozg on 05.03.2023.
 */

import {objectClassName, Type} from "../utils/types";

export abstract class EntityEffect<E extends Entity> {
	host:E|null = null;

	toString() {
		return `[${objectClassName(this)} ${this.host}]`
	}

	addTo(host:E) {
		if (this.host) throw new Error(`Effect ${this} already has host ${this.host}`);
		this.host = host;
		host.effectAdded(this);
		this.onAdd?.(host);
	}
	remove() {
		let host = this.host;
		this.host = null;
		if (host) {
			host.effectRemoved(this);
			this.onRemove?.(host);
		}
	}
	onAdd?: (host:E)=>void;
	onRemove?: (host:E)=>void;
	onTick?: (host:E)=>void;
}

export abstract class Entity {
	effects: EntityEffect<this>[] = [];
	parentEntity: Entity|null = null;
	childEntities: Entity[] = [];
	toString() {
		return `[${objectClassName(this)}]`
	}

	protected childAdded(e:Entity) {
		this.childEntities.push(e);
	}
	protected childRemoved(e:Entity) {
		this.childEntities.remove(e);
	}
	protected parentChanged(e:Entity|null) {
		this.parentEntity = e;
	}
	addChild(e:Entity) {
		e.parentChanged(this);
		this.childAdded(e);
	}
	removeChild(e:Entity) {
		e.parentChanged(null);
		this.childRemoved(e);
	}
	addEffect(e:EntityEffect<this>) {
		e.addTo(this);
	}
	effectAdded(e:EntityEffect<this>) {
		this.effects.push(e);
	}
	effectRemoved(e:EntityEffect<this>) {
		this.effects.remove(e);
	}
	findEffect<T extends EntityEffect<any>>(klass:Type<T>):T|undefined {
		return this.effects.find((c):c is T => c instanceof klass);
	}
	setParent(e:Entity|null) {
		if (e === this) throw new Error(`setParent(this) called on ${this}`)
		this.parentEntity?.childRemoved(this);
		this.parentEntity = e;
		e?.childAdded(this);
	}
	removeParent() {
		this.setParent(null);
	}
}
