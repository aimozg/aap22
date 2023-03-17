/*
 * Created by aimozg on 05.03.2023.
 */

import {GameObject} from "../ecs/GameObject";
import {XY} from "../../utils/grid/geom";
import {Cell, Level} from "./Level";
import {GlyphData} from "../../utils/ui/GlyphLayer";
import {objectClassName} from "../../utils/types";

// TODO this could be a component instead
export abstract class MapObject extends GameObject {

	protected constructor(clsid: string, bpid: string | null, uuid: number) {
		super(clsid, bpid, uuid);
	}

	pos: XY = {x: 0, y: 0};
	z = 0;
	parentEntity: Level|null;
	cell: Cell|undefined;

	moved(newPos: XY) {
		this.pos = newPos;
		this.cell = this.parentEntity?.cellAt(newPos);
	}
	setPos(newPos: XY) {
		if (!this.parentEntity) throw new Error(`MapObject.setPos with no level`);
		this.parentEntity?.moveObject(this, newPos);
	}
	toString() {
		return `[${objectClassName(this)} ${this.name} (${this.pos.x};${this.pos.y})]`
	}

	abstract name: string;
	abstract glyph: GlyphData;
	abstract walkable: boolean;

	static Z_CORPSE = 10;
	static Z_PLACEABLE = 20;
	static Z_ITEM = 30;
	static Z_CREATURE = 40;
}


