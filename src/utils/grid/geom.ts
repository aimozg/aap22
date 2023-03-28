/*
 * Created by aimozg on 28.02.2023.
 */

// TODO classes?
import {Dir8List} from "./grid";

export interface XY {
	x: number;
	y: number;
}
export namespace XY {
	export function distance2(p1:XY, p2:XY): number {
		return (p1.x-p2.x)**2 + (p1.y-p2.y)**2
	}
	export function distance(p1:XY, p2:XY): number {
		return Math.sqrt(distance2(p1,p2));
	}
	export function shift(xy:XY, dx:number, dy:number):XY {
		return {x:xy.x+dx,y:xy.y+dy}
	}
	export function add(a:XY,b:XY):XY {
		return {x:a.x+b.x,y:a.y+b.y};
	}
	export function subtract(a:XY,b:XY):XY {
		return {x:a.x-b.x,y:a.y-b.y};
	}
	export function adjacent8(xy1:XY, xy2:XY):boolean {
		return Math.abs(xy1.x-xy2.x) <= 1 &&
			Math.abs(xy1.y-xy2.y) <= 1;
	}
	export function neighbours8(xy:XY):XY[] {
		return Dir8List.map(dir=>({
			x:xy.x+dir.dx,
			y:xy.y+dir.dy,
		}));
	}
}

export class  XYRect {
	constructor(
		public x1: number,
		public y1: number,
		public x2: number,
		public y2: number,
	) {
		if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)
			|| x1 > x2 || y1 > y2) throw new Error(`Invalid XYRect params ${x1};${y1}, ${x2};${y2}`)
	}

	get fwidth():number {
		return this.x2 - this.x1;
	}
	get fheight():number {
		return this.y2 - this.y1;
	}
	get iwidth():number {
		return this.x2 + 1 - this.x1;
	}
	get iheight():number {
		return this.y2 + 1 - this.y1;
	}
	iarea():number {
		return this.iwidth*this.iheight;
	}
	fcenter():XY {
		return {
			x: (this.x1 + this.x2) / 2,
			y: (this.y1 + this.y2) / 2
		}
	}
	icenter():XY {
		let c = this.fcenter();
		c.x|=0;
		c.y|=0;
		return c;
	}
	get topLeft():XY {
		return {x:this.x1,y:this.y1}
	}
	get bottomRight():XY {
		return {x:this.x2,y:this.y2}
	}
	scale(sx:number, sy:number=sx):XYRect {
		return new XYRect(
			this.x1*sx,
			this.y1*sy,
			this.x2*sx,
			this.y2*sy
		);
	}
	includes(point:XY):boolean {
		return this.x1 <= point.x && point.x <= this.x2 &&
			this.y1 <= point.y && point.y <= this.y2;
	}
	includesRect(rect:XYRect):boolean {
		return this.x1 <= rect.x1 && rect.x2 <= this.x2 &&
			this.y1 <= rect.y1 && rect.y2 <= this.y2;
	}
	intersects(rect:XYRect):boolean {
		return this.x1 <= rect.x2 && rect.x1 <= this.x2 &&
			this.y1 <= rect.y2 && rect.y1 <= this.y2
	}
	intersection(rect:XYRect):XYRect|null {
		let x1 = Math.max(this.x1,rect.x1);
		let y1 = Math.max(this.y1,rect.y1);
		let x2 = Math.min(this.x2,rect.x2);
		let y2 = Math.min(this.y2,rect.y2);
		if (x1 > x2 || y1 > y2) return null;
		return new XYRect(x1, y1, x2, y2);
	}
	intCells():XY[] {
		let result:XY[] = [];
		for (let y = this.y1; y <= this.y2; y++)
			for (let x = this.x1; x <= this.x2; x++)
				result.push({x,y});
		return result;
	}
	forEachXY(iter:(cell:XY)=>void) {
		for (let y = this.y1; y <= this.y2; y++)
			for (let x = this.x1; x <= this.x2; x++)
				iter({x,y});
	}
	mapXY<O>(iter:(cell:XY)=>O):O[] {
		let result:O[] = [];
		for (let y = this.y1; y <= this.y2; y++)
			for (let x = this.x1; x <= this.x2; x++)
				result.push(iter({x,y}));
		return result;
	}
	perimeter(): XY[] {
		let result:XY[] = [];
		this.perimeterForEach(xy=> {result.push(xy)});
		return result;
	}

	/**
	 * Iterate coordinates topleft->topright->bottomright->bottomleft
	 * @param callback Return exactly `false` to stop iteration
	 */
	perimeterForEach(callback:(cell:XY)=>unknown): void {
		let {x1,y1,x2,y2} = this;
		for (let x = x1; x <= x2; x++) if (callback({x,y:y1}) === false) return;
		for (let y = y1+1; y <= y2; y++) if (callback({x:x2,y}) === false) return;
		for (let x = x2-1; x >= x1; x--) if (callback({x,y:y2}) === false) return;
		for (let y = y2-1; y > y1; y--) if (callback({x:x1,y}) === false) return;
	}
	static fromWH(width: number, height: number, x1: number = 0, y1: number = 0):XYRect {
		return new XYRect(
			x1,
			y1,
			x1+width,
			y1+height
		)
	}
	static fromWHint(width: number, height: number, x1: number = 0, y1: number = 0):XYRect {
		return new XYRect(
			x1,
			y1,
			x1+width-1,
			y1+height-1
		)
	}
	static fromCorners(topLeft:XY, bottomRight:XY):XYRect {
		return new XYRect(
			topLeft.x,
			topLeft.y,
			bottomRight.x,
			bottomRight.y,
		);
	}
	static fromCenter(center:XY, width:number, height:number):XYRect {
		width /= 2;
		height /= 2;
		return new XYRect(
			center.x - width,
			center.y - height,
			center.x + width,
			center.y + height
		);
	}

	expand(dx: number, dy: number = dx): XYRect {
		return new XYRect(
			this.x1-dx,
			this.x1-dy,
			this.x2+dx,
			this.y2+dy
		);
	}
}
