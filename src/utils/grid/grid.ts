/*
 * Created by aimozg on 05.03.2023.
 */

import {XY, XYRect} from "./geom";

export interface IDir {
	dx: number;
	dy: number;
}

export type Dir8Id = "UL" | "U" | "UR" | "L" | "R" | "DL" | "D" | "DR";

export interface IDir8 extends IDir {
	id: Dir8Id;
	opposite: Dir8Id;
}

export let Dir8: Readonly<Record<Dir8Id, IDir8>> = Object.freeze({
	"U": {id: "U", dx: 0, dy: -1, opposite: "D"},
	"L": {id: "L", dx: -1, dy: 0, opposite: "R"},
	"R": {id: "R", dx: +1, dy: 0, opposite: "L"},
	"D": {id: "D", dx: 0, dy: +1, opposite: "U"},
	"UL": {id: "UL", dx: -1, dy: -1, opposite: "DR"},
	"UR": {id: "UR", dx: +1, dy: -1, opposite: "DL"},
	"DL": {id: "DL", dx: -1, dy: +1, opposite: "UR"},
	"DR": {id: "DR", dx: +1, dy: +1, opposite: "UL"},
});

export let Dir8List = Object.values(Dir8);

export type Dir4Id = "U" | "D" | "L" | "R";

export interface IDir4 extends IDir {
	id: Dir4Id;
	opposite: Dir4Id;
}

export let Dir4: Readonly<Record<Dir4Id, IDir4>> = Object.freeze({
	"U": {id: "U", dx: -1, dy: -1, opposite: "D"},
	"L": {id: "L", dx: -1, dy: 0, opposite: "R"},
	"R": {id: "R", dx: +1, dy: 0, opposite: "L"},
	"D": {id: "D", dx: 0, dy: +1, opposite: "U"},
});

export let Dir4List = Object.values(Dir4);

export function xyPlusDir(pos: XY, dir: IDir | Dir8Id): XY {
	if (typeof dir === "string") dir = Dir8[dir];
	return XY.shift(pos, dir.dx, dir.dy);
}

export function dir8to(from: XY, to: XY): IDir8 {
	let dx = to.x - from.x;
	let dy = to.y - from.y;
	if (dy < 0) {
		if (dx < 0) return Dir8.UL;
		else if (dx === 0) return Dir8.U;
		else return Dir8.UR;
	} else if (dy === 0) {
		if (dx < 0) return Dir8.L;
		else return Dir8.R;
	} else {
		if (dx < 0) return Dir8.DL;
		else if (dx === 0) return Dir8.D;
		else return Dir8.DR;
	}
}

export type SideID = "U" | "D" | "L" | "R";

export interface Side {
	id: SideID;
	opposite: SideID;
	x0: number;
	y0: number;
	dx: number;
	dy: number;
}

export let Sides: Record<SideID, Side> = Object.freeze({
	"U": {id: "U", opposite: "D", x0: 0, y0: 0, dx: +1, dy: 0},
	"D": {id: "D", opposite: "U", x0: 0, y0: 1, dx: +1, dy: 0},
	"L": {id: "L", opposite: "R", x0: 0, y0: 0, dx: 0, dy: +1},
	"R": {id: "R", opposite: "L", x0: 1, y0: 0, dx: 0, dy: +1},
});
export let SideList                    = Object.freeze(Object.values(Sides));

export function sideCoords(side: Side | SideID, rect: XYRect): XY[] {
	if (typeof side === "string") side = Sides[side];
	let x            = side.x0 ? rect.x2 : rect.x1;
	let y            = side.y0 ? rect.y2 : rect.y1;
	let result: XY[] = [];
	while (x <= rect.x2 && y <= rect.y2) {
		result.push({x, y});
		x += side.dx;
		y += side.dy;
	}
	return result;
}
