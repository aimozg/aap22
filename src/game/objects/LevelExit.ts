/*
 * Created by aimozg on 07.03.2023.
 */
import {MapObject} from "../core/MapObject";
import {GlyphData} from "../../utils/ui/GlyphLayer";
import {Colors} from "../../utils/ui/canvas";

export class LevelExit extends MapObject {
	constructor() {super();}

	glyph: GlyphData = {
		ch: '>',
		fg: Colors.YELLOW
	};
	name = "exit";
	walkable = true;
	z = MapObject.Z_PLACEABLE;
}
