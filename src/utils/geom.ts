/*
 * Created by aimozg on 28.02.2023.
 */

// TODO classes?
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
}

export interface XYRect {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}
export namespace XYRect {
	export function fwidth(rect:XYRect):number {
		return rect.x2 - rect.x1;
	}
	export function fheight(rect:XYRect):number {
		return rect.y2 - rect.y1;
	}
	export function iwidth(rect:XYRect):number {
		return rect.x2 + 1 - rect.x1;
	}
	export function iheight(rect:XYRect):number {
		return rect.y2 + 1 - rect.y1;
	}
	export function isize(rect:XYRect):number {
		return iwidth(rect)*iheight(rect);
	}
	export function fcenter(rect:XYRect):XY {
		return {
			x: (rect.x1 + rect.x2) / 2,
			y: (rect.y1 + rect.y2) / 2
		}
	}
	export function icenter(rect:XYRect):XY {
		let c = fcenter(rect);
		c.x|=0;
		c.y|=0;
		return c;
	}
	export function topLeft(rect:XYRect):XY {
		return {x:rect.x1,y:rect.y1}
	}
	export function bottomRight(rect:XYRect):XY {
		return {x:rect.x2,y:rect.y2}
	}
	export function includes(rect:XYRect, point:XY):boolean {
		return rect.x1 <= point.x && point.x <= rect.x2 &&
			rect.y1 <= point.y && point.y <= rect.y2;
	}
	export function cells(rect:XYRect):XY[] {
		let result:XY[] = [];
		for (let y = rect.y1; y <= rect.y2; y++)
			for (let x = rect.x1; x <= rect.x2; x++)
				result.push({x,y});
		return result;
	}
	export function forEach(rect:XYRect, iter:(cell:XY)=>void) {
		for (let y = rect.y1; y <= rect.y2; y++)
			for (let x = rect.x1; x <= rect.x2; x++)
				iter({x,y});
	}
	export function map<O>(rect:XYRect, iter:(cell:XY)=>O):O[] {
		let result:O[] = [];
		for (let y = rect.y1; y <= rect.y2; y++)
			for (let x = rect.x1; x <= rect.x2; x++)
				result.push(iter({x,y}));
		return result;
	}
	export function perimeter(rect:XYRect): XY[] {
		let result:XY[] = [];
		perimeterForEach(rect,xy=> {result.push(xy)});
		return result;
	}

	/**
	 * Iterate coordinates topleft->topright->bottomright->bottomleft
	 * @param rect
	 * @param callback Return exactly `false` to stop iteration
	 */
	export function perimeterForEach(rect:XYRect, callback:(cell:XY)=>any): void {
		let {x1,y1,x2,y2} = rect;
		for (let x = x1; x <= x2; x++) if (callback({x,y:y1}) === false) return;
		for (let y = y1+1; y <= y2; y++) if (callback({x:x2,y}) === false) return;
		for (let x = x2-1; x >= x1; x--) if (callback({x,y:y2}) === false) return;
		for (let y = y2-1; y > y1; y--) if (callback({x:x1,y}) === false) return;
	}
	export function fromWH(width:number, height:number, top:number=0, left:number=0):XYRect {
		return {
			x1: left,
			y1: top,
			x2:left+width-1,
			y2:top+height-1
		}
	}
	export function fromCorners(topLeft:XY, bottomRight:XY):XYRect {
		return {
			x1:topLeft.x,
			y1:topLeft.y,
			x2:bottomRight.x,
			y2:bottomRight.y,
		}
	}
	export function fromCenter(center:XY, width:number, height:number):XYRect {
		width /= 2;
		height /= 2;
		return {
			x1: center.x - width,
			x2: center.x + width,
			y1: center.y - height,
			y2: center.y - height
		}
	}
	export function expand(base:XYRect, dx:number, dy:number=dx):XYRect {
		return {
			x1: base.x1-dx,
			x2:base.x2+dx,
			y1:base.x1-dy,
			y2:base.y2+dy
		}
	}
}
