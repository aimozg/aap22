/*
 * Created by aimozg on 08.03.2023.
 */
import {AbstractCanvasLayer} from "../../utils/ui/LayeredCanvas";

export interface Decal {
	x: number;
	y: number;
	color: string;
	size: number;
}

export class DecalLayer extends AbstractCanvasLayer {

	constructor(id: string,
	            public pixelSize: number) {
		super(id);
	}
	decals: Decal[] = [];
	addDecal(decal:Decal) {
		this.decals.push(decal);
	}
	clear() {
		this.decals = [];
	}

	drawTo(dst: CanvasRenderingContext2D): void {
		for (let d of this.decals) {
			dst.fillStyle = d.color;
			dst.fillRect(d.x,d.y,d.size,d.size);
		}
	}

}
