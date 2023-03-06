/*
 * Created by aimozg on 05.03.2023.
 */

import {GlyphData} from "../ui/GlyphLayer";
import Chars from "../../utils/ui/chars";
import * as tinycolor from "tinycolor2";
import {Colors} from "../../utils/ui/canvas";

// TODO make it class?
export interface Tile extends GlyphData {
	vision: boolean;
	walk: boolean;
}

// TODO store ids and have TileMeta EnumValue?
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
	export const collapsed_wall:Tile = {
		ch: Chars.TRIANGLE_UP,
		fg: tinycolor(Colors.LIGHTGRAY),
		vision: true,
		walk: false
	};
	export const door_closed:Tile = {
		ch: Chars.INVERSE_CIRCLE_WHITE,
		fg: tinycolor(Colors.WHITE),
		vision: false,
		walk: false
	};
	export const door_open:Tile = {
		ch: Chars.BLOCK_LHALF,
		fg: tinycolor(Colors.WHITE),
		vision: true,
		walk: true
	};
	export const water:Tile = {
		ch: Chars.BLOCK_50,
		fg: tinycolor(Colors.CYAN),
		bg: tinycolor(Colors.LIGHTCYAN),
		vision: true,
		walk: false
	};
	export const lava:Tile = {
		ch: Chars.BLOCK_50,
		fg: tinycolor(Colors.LIGHTRED),
		bg: tinycolor(Colors.LIGHTORANGE),
		vision: true,
		walk: false
	};
}
