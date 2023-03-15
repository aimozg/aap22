/*
 * Created by aimozg on 06.03.2023.
 */

import {MapObject} from "../core/MapObject";
import * as tinycolor from "tinycolor2";
import {GlyphData} from "../../utils/ui/GlyphLayer";
import {UUID} from "../ecs/utils";
import {ChildGameObject} from "../ecs/GameObject";

export class Corpse extends MapObject {
	constructor(
		public name: string,
		color: string,
		uuid: number = UUID()
	) {
		super("Corpse", null, uuid);
		this.glyph = {
			ch: '⁔',
			fg: tinycolor(color)
		};
	}
	glyph: GlyphData;
	walkable = true;
	z = MapObject.Z_CORPSE;

	saveChildren(): ChildGameObject[] {
		return [];
	}
}
