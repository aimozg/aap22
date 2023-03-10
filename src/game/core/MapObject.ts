/*
 * Created by aimozg on 05.03.2023.
 */

import {Entity} from "../Entity";
import {XY} from "../../utils/grid/geom";
import {Cell, Level} from "./Level";
import {GlyphData} from "../ui/GlyphLayer";
import {objectClassName} from "../../utils/types";

export abstract class MapObject extends Entity {
	pos: XY = {x:0,y:0};
	z = 0;
	declare parentEntity: Level|null;

	moved(newPos: XY) {
		this.pos = newPos;
	}
	setPos(newPos: XY) {
		if (!this.parentEntity) throw new Error(`MapObject.setPos with no level`);
		this.parentEntity?.moveObject(this, newPos);
	}
	toString() {
		return `[${objectClassName(this)} ${this.name} (${this.pos.x};${this.pos.y})]`
	}
	get cell():Cell {
		if (!this.parentEntity) throw new Error(`MapObject.cell with no level`);
		// TODO make parentEntity a Cell
		return this.parentEntity.cellAt(this.pos);
	}

	abstract name: string;
	abstract glyph: GlyphData;
	abstract walkable: boolean;

	static Z_CORPSE = 10;
	static Z_PLACEABLE = 20;
	static Z_ITEM = 30;
	static Z_CREATURE = 40;
}


