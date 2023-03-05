/*
 * Created by aimozg on 05.03.2023.
 */

import {Entity} from "../Entity";
import {XY} from "../../utils/geom";
import {Level} from "./Level";
import {GlyphData} from "../ui/GlyphLayer";

export abstract class MapObject extends Entity {
	pos: XY = {x:0,y:0};
	z = 0;
	parentEntity: Level;

	moved(newPos: XY) {
		this.pos = newPos;
	}
	setPos(newPos: XY) {
		this.parentEntity.moveObject(this, newPos);
	}

	abstract name: string;
	abstract glyph: GlyphData;
	abstract walkable: boolean;

	static Z_CORPSE = 10;
	static Z_PLACEABLE = 20;
	static Z_ITEM = 30;
	static Z_CREATURE = 40;
}


