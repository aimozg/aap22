/*
 * Created by aimozg on 05.03.2023.
 */

import {GlyphData} from "../ui/GlyphLayer";
import Chars from "../../utils/ui/chars";

// TODO make it class
export interface Tile extends GlyphData {
	vision: boolean;
	walk: boolean;
}

export namespace Tiles {
	export const nothing:Tile = {
		ch: ' ',
		fg: '#000000',
		vision: false,
		walk: false
	};
	export const floor:Tile = {
		ch: '.',
		fg: '#777777',
		vision: true,
		walk: true
	};
	export const wall:Tile = {
		ch: Chars.BLOCK_100,
		fg: '#777777',
		vision: false,
		walk: false
	};
}
