/*
 * Created by aimozg on 08.03.2023.
 */
import {AbstractCanvasLayer} from "./LayeredCanvas";
import {XYRect} from "../grid/geom";

export interface Decal {
	x: number;
	y: number;
	color: string;
	size: number;
}

export class DecalLayer extends AbstractCanvasLayer {

	constructor(id: string) {
		super(id);
	}
	decals: Decal[] = [];
	addDecal(decal:Decal) {
		this.decals.push(decal);
	}
	clear() {
		this.decals = [];
	}

	drawTo(dst: CanvasRenderingContext2D, visibleRect: XYRect): void {
		for (let d of this.decals) {
			if (visibleRect.intersects(XYRect.fromWH(d.size, d.size, d.x, d.y))) {
				dst.fillStyle = d.color;
				dst.fillRect(d.x, d.y, d.size, d.size);
			}
		}
	}

}
