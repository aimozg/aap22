/*
 * Created by aimozg on 06.03.2023.
 */

import {Level} from "../core/Level";
import {Tiles} from "../core/Tile";

function rotate90(layout:string[]):string[] {
	let result = [];
	let srch = layout.length;
	let srcw = layout[0].length;
	for (let col = 0; col < srcw; col++) {
		let s = '';
		for (let row = srch-1; row >= 0; row--) {
			s += layout[row][col]
		}
		result.push(s);
	}
	return result;
}
function fliph(layout:string[]):string[] {
	let result = [];
	for (let row = 0; row < layout.length; row++) {
		let s = '';
		for (let col = layout[row].length-1; col >= 0; col--) {
			s += layout[row][col];
		}
		result.push(s);
	}
	return result;
}
function flipv(layout:string[]):string[] {
	let result = [];
	for (let row = layout.length-1; row >= 0; row--) {
		let s = '';
		for (let col = 0; col < layout[row].length; col++) {
			s += layout[row][col];
		}
		result.push(s);
	}
	return result;
}
function equals(a:any,b:any):boolean {
	if (a === b) return true;
	if (typeof a !== typeof b) return false;
	if (typeof a !== 'object') return a === b;
	if (a === null) return b === null;
	if (Array.isArray(a)) {
		if (!Array.isArray(b)) return false;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!equals(a[i],b[i])) return false;
		}
		return true;
	}
	if ('equals' in a && typeof a.equals === 'function') {
		return a.equals(b);
	}
	return equals(Object.entries(a),Object.entries(b));
}
export function layoutSymmetricalVariants(layout:string[]):string[][] {
	let r90 = rotate90(layout);
	let r180= rotate90(r90);
	let r270= rotate90(r180);
	let f = fliph(layout);
	let f90 = fliph(r90);
	let f180 = fliph(r180);
	let f270 = fliph(r270);
	let result:string[][] = []
	let candidates = [layout,r90,r180,r270,f,f90,f180,f270];
	for (let c of candidates) {
		if (result.some(r=>equals(r,c))) continue;
		result.push(c);
	}
	return result;
}

export function cleanupTiles(level:Level) {
	for (let cell of level.cells) {
		if (cell.tile === Tiles.door_closed) {
			// Remove door if it's near another door or doesn't lead to anything
			if (level.count8(cell.xy, Tiles.door_closed) > 0) {
				cell.tile = Tiles.floor
			} else if (level.count8(cell.xy, Tiles.floor) < 2) {
				cell.tile = Tiles.floor
			}
		}
	}
}
