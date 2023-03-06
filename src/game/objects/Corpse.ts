/*
 * Created by aimozg on 06.03.2023.
 */

import {MapObject} from "../core/MapObject";
import * as tinycolor from "tinycolor2";
import {GlyphData} from "../ui/GlyphLayer";

export class Corpse extends MapObject {
	constructor(
		public name: string,
		color: string
	) {
		super();
		this.glyph = {
			ch: 'ξ',
			fg: tinycolor(color)
		};
	}
	glyph: GlyphData;
	walkable = true;
	z = MapObject.Z_CORPSE;
}
