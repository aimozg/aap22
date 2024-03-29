/*
 * Created by aimozg on 05.03.2023.
 */

import {GlyphData} from "../../utils/ui/GlyphLayer";
import Chars from "../../utils/ui/chars";
import * as tinycolor from "tinycolor2";
import {Colors} from "../../utils/ui/canvas";

// TODO make it class?
export interface Tile extends GlyphData {
	id: number;
	name: string;
	vision: boolean;
	walk: boolean;
}

// TODO store ids and have TileMeta EnumValue?
export namespace Tiles {
	let defaultBg= tinycolor(Colors.VDARKGRAY);
	export const ALL = new Map<number,Tile>();
	export function byId(id:number):Tile {
		if (!ALL.has(id)) throw new Error(`Unknown tile id ${id}`);
		return ALL.get(id)!;
	}
	function registerTile(tile:Tile):Tile {
		ALL.set(tile.id,tile);
		return tile;
	}
	export const nothing:Tile = registerTile({
		id: 0,
		name: "nothingness",
		ch: ' ',
		fg: tinycolor(Colors.BLACK),
		vision: false,
		walk: false
	});
	export const floor:Tile = registerTile({
		id: 1,
		name: "floor",
		// ch: '.',
		// fg: tinycolor(Colors.DARKGRAY),
		ch: '',
		fg: '',
		bg: defaultBg,
		vision: true,
		walk: true
	});
	export const wall:Tile = registerTile({
		id: 2,
		name: "wall",
		ch: '',
		fg: '',
		bg: tinycolor(Colors.LIGHTGRAY),
		vision: false,
		walk: false
	});
	export const collapsed_wall:Tile = registerTile({
		id: 3,
		name: "collapsed wall",
		ch: Chars.TRIANGLE_UP,
		fg: tinycolor(Colors.LIGHTGRAY),
		bg: defaultBg,
		vision: true,
		walk: false
	});
	export const door_closed:Tile = registerTile({
		id: 4,
		name: "closed door",
		ch: Chars.INVERSE_CIRCLE_WHITE,
		fg: tinycolor(Colors.WHITE),
		bg: defaultBg,
		vision: false,
		walk: false
	});
	export const door_open:Tile = registerTile({
		id: 5,
		name: "open door",
		ch: Chars.BLOCK_LHALF,
		fg: tinycolor(Colors.WHITE),
		bg: defaultBg,
		vision: true,
		walk: true
	});
	export const water:Tile = registerTile({
		id: 6,
		name: "water",
		ch: Chars.BLOCK_50,
		fg: tinycolor(Colors.CYAN),
		bg: tinycolor(Colors.LIGHTCYAN),
		vision: true,
		walk: false
	});
	export const lava:Tile = registerTile({
		id: 7,
		name: "lava",
		ch: Chars.BLOCK_50,
		fg: tinycolor(Colors.LIGHTRED),
		bg: tinycolor(Colors.LIGHTORANGE),
		vision: true,
		walk: false
	});

}
