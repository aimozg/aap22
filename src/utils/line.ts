/*
 * Created by aimozg on 08.03.2023.
 */

import {XY} from "./geom";

export function bresenline(x0:number, y0:number, x1:number, y1:number):XY[] {
	let ax,a0,a1,b0,b1;
	if (Math.abs(y1-y0) < Math.abs(x1-x0)) {
		if (x0 > x1) return bresenline(x1,y1,x0,y0).reverse();
		ax = true;
		a0 = x0;
		a1 = x1;
		b0 = y0;
		b1 = y1;
	} else {
		if (y0 > y1) return bresenline(x1,y1,x0,y0).reverse();
		ax = false;
		a0 = y0;
		a1 = y1;
		b0 = x0;
		b1 = x1;
	}
	let da = a1 - a0;
	let db = b1 - b0;
	let bi = 1;
	if (db < 0) {
		bi = -1;
		db = -db;
	}
	let D = (2 * db) - da;
	let b = b0;
	let result: XY[] = [];
	for (let a = a0; a <= a1; a++) {
		result.push(ax ? {x:a,y:b} : {x:b,y:a});
		if (D > 0) {
			b = b + bi;
			D = D + (2 * (db - da));
		} else {
			D = D + 2 * db
		}
	}
	return result;
}
