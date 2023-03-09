/*
 * Created by aimozg on 09.03.2023.
 */

import {XY} from "./geom";
import {Dir4List, Dir8List, IDir, xyPlusDir} from "./grid";

export function prepateInt8Map(
	width: number,
	height: number,
	fill: (x: number, y: number) => number
): Int8Array {
	let arr = new Int8Array(width * height);
	let i   = 0;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++, i++) {
			arr[i] = fill(x, y);
		}
	}
	return arr;
}

export type ICellIsPassable = (x: number, y: number) => boolean;

export function fillDijkstraMap(
	map: Int8Array,
	width: number,
	height: number,
	provider: ICellIsPassable,
	start: XY[],
	ndirs: 4 | 8
) {
	let dirlist: IDir[] = ndirs === 4 ? Dir4List : Dir8List;
	let queue           = start.slice();
	let done            = new Set<number>();
	for (let k of start) done.add(k.y * width + k.x);
	while (queue.length > 0) {
		let {x, y} = queue.shift()!;
		let n      = map[y * width + x] + 1;
		if (n > 127) continue;
		for (let dir of dirlist) {
			let x2 = x + dir.dx, y2 = y + dir.dy;
			if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) continue;
			let i2 = y2 * width + x2;
			if (done.has(i2)) continue;
			if (!provider(x2, y2)) continue;
			done.add(i2);
			map[i2] = n;
			queue.push({x:x2,y:y2});
		}
	}
}


export function findGradient(
	map: Int8Array,
	width: number,
	height: number,
	pos: XY,
	ndirs: 4 | 8,
	descend: boolean
): IDir | undefined {
	let dirlist: IDir[] = ndirs === 4 ? Dir4List : Dir8List;
	let n0              = map[pos.y * height + pos.x];
	type Entry = { dir: IDir; n: number };
	let list: Entry[] = dirlist.map(dir => {
			let xy = xyPlusDir(pos, dir);
			return ({dir: dir, n: map[xy.y * height + xy.x]});
		}
	)
	let best:Entry|undefined;
	if (descend) {
		best = list.minOn("n");
		if (best && best.n <= n0) return best.dir;
	} else {
		best = list.maxOn("n");
		if (best && best.n >= n0) return best.dir;
	}
	return undefined;
}
