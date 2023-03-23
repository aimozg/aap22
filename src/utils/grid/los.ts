/*
 * Created by aimozg on 08.03.2023.
 */

import {XY, XYRect} from "./geom";
import {bresenline} from "./line";

export interface LosProvider {
	rect: XYRect;

	seeThrough(xy: XY): boolean;
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
	vismap: Int8Array = new Int8Array(input.rect.iarea())
): Int8Array {
	let width  = input.rect.iwidth;
	// TODO fog of war
	if (clear) vismap.fill(0);
	vismap[start.y * width + start.x] = 1;
	let border = new Set<number>(); // farthest visible cells

	input.rect.perimeterForEach(xy => {
		let cast = bresenline(start.x, start.y, xy.x, xy.y);
		for (let i = 1; i < cast.length; i++) {
			let xy      = cast[i];
			let idx     = xy.y * width + xy.x;
			vismap[idx] = 1;
			if (!input.seeThrough(xy)) {
				border.add(idx);
				break;
			}
		}
	});
	// reveal solids that have a visible neighbouring floor cell
	for (let bi of border) {
		let x = bi % width, y = (bi - x) / width;
		for (let nxy of XY.neighbours8({x,y})) {
			let ni = nxy.y*width+nxy.x;
			if (vismap[ni]) continue;
			if (input.rect.includes(nxy) && !input.seeThrough(nxy)) {
				for (let n2xy of XY.neighbours8(nxy)) {
					let n2i = n2xy.y*width+n2xy.x;
					if (input.rect.includes(n2xy) && input.seeThrough(n2xy) && vismap[n2i]) {
						vismap[ni] = 1;
						break;
					}
				}
			}
		}
	}

	return vismap;
}

export function checkLineOfSight(input: LosProvider,
                       xy1: XY,
                       xy2: XY): boolean {
	for (let xy of bresenline(xy1.x,xy1.y,xy2.x,xy2.y)) {
		if (!input.seeThrough(xy)) return false;
	}
	return true;
}
