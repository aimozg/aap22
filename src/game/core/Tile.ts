/*
 * Created by aimozg on 05.03.2023.
 */

import {GlyphData} from "../ui/GlyphLayer";
import Chars from "../../utils/ui/chars";
import * as tinycolor from "tinycolor2";
import {Colors} from "../../utils/ui/canvas";

// TODO make it class
export interface Tile extends GlyphData {
	vision: boolean;
	walk: boolean;
}

export namespace Tiles {
	export const nothing:Tile = {
		ch: ' ',
		fg: tinycolor(Colors.BLACK),
		vision: false,
		walk: false
	};
	export const floor:Tile = {
		ch: '.',
		fg: tinycolor(Colors.DARKGRAY),
		vision: true,
		walk: true
	};
	export const wall:Tile = {
		ch: Chars.BLOCK_100,
		fg: tinycolor(Colors.LIGHTGRAY),
		vision: false,
		walk: false
	};
}
