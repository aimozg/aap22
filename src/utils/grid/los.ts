/*
 * Created by aimozg on 08.03.2023.
 */

import {XY, XYRect} from "./geom";
import {bresenline} from "./line";

export interface LosProvider {
	rect: XYRect;

	visible(idx: number): boolean;
}

/**
 * Calculate visibility map
 * @param input
 * @param start
 * @param clear Clear visibility map
 * @param vismap Where to store visibility
 * @return Row-by-row visibility map, 0=invisible, 1=visible.
 */
export function genVisibilityMap(
	input: LosProvider,
	start: XY,
	clear: boolean,
	vismap: Int8Array = new Int8Array(XYRect.isize(input.rect))
): Int8Array {
	let width  = XYRect.iwidth(input.rect);
	// TODO fog of war
	if (clear) vismap.fill(0);
	vismap[start.y * width + start.x] = 1;

	XYRect.perimeterForEach(input.rect, xy => {
		let cast = bresenline(start.x, start.y, xy.x, xy.y);
		for (let i = 1; i < cast.length; i++) {
			let {x, y}  = cast[i];
			let idx     = y * width + x;
			vismap[idx] = 1;
			if (!input.visible(idx)) break;
		}
	});

	return vismap;
}

export function checkLineOfSight(input: LosProvider,
                       xy1: XY,
                       xy2: XY): boolean {
	let w = XYRect.iwidth(input.rect);
	for (let xy of bresenline(xy1.x,xy1.y,xy2.x,xy2.y)) {
		if (!input.visible(w*xy.y+xy.x)) return false;
	}
	return true;
}
