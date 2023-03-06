/*
 * Created by aimozg on 05.03.2023.
 */

import {XY, XYRect} from "./geom";

export type Dir8Id = "UL" | "U" | "UR" | "L" | "R" | "DL" | "D" | "DR";

export interface IDir8 {
	id: Dir8Id;
	dx: number;
	dy: number;
	opposite: Dir8Id;
}

export let Dir8: Readonly<Record<Dir8Id, IDir8>> = Object.freeze({
	"UL": {id: "UL", dx: -1, dy: -1, opposite: "DR"},
	"U": {id: "U", dx: 0, dy: -1, opposite: "D"},
	"UR": {id: "UR", dx: +1, dy: -1, opposite: "DL"},
	"L": {id: "L", dx: -1, dy: 0, opposite: "R"},
	"R": {id: "R", dx: +1, dy: 0, opposite: "L"},
	"DL": {id: "DL", dx: -1, dy: +1, opposite: "UR"},
	"D": {id: "D", dx: 0, dy: +1, opposite: "U"},
	"DR": {id: "DR", dx: +1, dy: +1, opposite: "UL"},
});

export let Dir8List = Object.values(Dir8);

export function xyPlusDir(pos:XY, dir:IDir8|Dir8Id):XY {
	if (typeof dir === "string") dir = Dir8[dir];
	return XY.shift(pos, dir.dx, dir.dy);
}

export type SideID = "U"|"D"|"L"|"R";

export interface Side {
	id: SideID;
	opposite: SideID;
	x0: number;
	y0: number;
	dx: number;
	dy: number;
}

export let Sides: Record<SideID, Side> = Object.freeze({
	"U": { id: "U", opposite: "D", x0: 0, y0: 0, dx: +1, dy: 0 },
	"D": { id: "D", opposite: "U", x0: 0, y0: 1, dx: +1, dy: 0 },
	"L": { id: "L", opposite: "R", x0: 0, y0: 0, dx: 0, dy: +1 },
	"R": { id: "R", opposite: "L", x0: 1, y0: 0, dx: 0, dy: +1 },
});
export let SideList = Object.freeze(Object.values(Sides));

export function sideCoords(side:Side|SideID, rect:XYRect):XY[] {
	if (typeof side === "string") side = Sides[side];
	let x = side.x0 ? rect.right : rect.left;
	let y = side.y0 ? rect.bottom : rect.top;
	let result:XY[] = [];
	while (x <= rect.right && y <= rect.bottom) {
		result.push({x,y});
		x += side.dx;
		y += side.dy;
	}
	return result;
}
