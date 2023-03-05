/*
 * Created by aimozg on 05.03.2023.
 */

export abstract class Effect<E extends Entity> {
	host:E;
	onAdd?: (host:E)=>void;
	onRemove?: (host:E)=>void;
}

export abstract class Entity {
	effects: Effect<this>[];
	parentEntity: Entity|null = null;
	childEntities: Entity[] = [];

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
