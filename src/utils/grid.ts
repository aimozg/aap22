/*
 * Created by aimozg on 05.03.2023.
 */

import {XY} from "./geom";

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

function addDir(pos:XY, dir:IDir8):XY {
	return XY.shift(pos, dir.dx, dir.dy);
}
