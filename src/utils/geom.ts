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
}

export interface XYRect {
	top: number;
	left: number;
	right: number;
	bottom: number;
}
export namespace XYRect {
	export function width(rect:XYRect):number {
		return rect.right - rect.left;
	}
	export function height(rect:XYRect):number {
		return rect.bottom - rect.top;
	}
	export function center(rect:XYRect):XY {
		return {
			x: (rect.left + rect.right) / 2,
			y: (rect.top + rect.bottom) / 2
		}
	}
	export function topLeft(rect:XYRect):XY {
		return {x:rect.left,y:rect.top}
	}
	export function bottomRight(rect:XYRect):XY {
		return {x:rect.right,y:rect.bottom}
	}
	export function includess(rect:XYRect, point:XY):boolean {
		return rect.left <= point.x && point.x <= rect.right &&
			rect.top <= point.y && point.y <= rect.bottom;
	}
	export function fromCornerss(topLeft:XY, bottomRight:XY):XYRect {
		return {
			left:topLeft.x,
			top:topLeft.y,
			right:bottomRight.x,
			bottom:bottomRight.y,
		}
	}
	export function fromCenter(center:XY, width:number, height:number):XYRect {
		width /= 2;
		height /= 2;
		return {
			left: center.x - width,
			right: center.x + width,
			top: center.y - height,
			bottom: center.y - height
		}
	}
	export function expand(base:XYRect, dx:number, dy:number=dx):XYRect {
		return {
			left: base.left-dx,
			right:base.right+dx,
			top:base.left-dy,
			bottom:base.bottom+dy
		}
	}
}
