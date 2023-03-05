/*
 * Created by aimozg on 05.03.2023.
 */

import {Entity} from "../Entity";
import {MultiMap} from "../../utils/MultiMap";
import {MapObject} from "./MapObject";
import {XY} from "../../utils/geom";
import {createArray} from "../../utils/collections";
import {Tile, Tiles} from "./Tile";
import {coerce} from "../../utils/math/utils";
import {Random} from "../../utils/math/Random";

function xy2id(xy:XY):number {
	return (xy.y<<16)|xy.x;
}

export interface Cell {
	xy: XY;
	tile: Tile;
	mobjs: MapObject[];
}

export class Level extends Entity {
	constructor(public readonly width:number,
	            public readonly height:number) {
		super();
	}
	// TODO store cells instead of objects+tiles
	objects = new MultiMap<number, MapObject>()
	tiles = createArray(this.width*this.height, ()=>Tiles.nothing)
	xy2i(x:number, y:number):number {
		return y*this.width + x;
	}
	contains(xy:XY):boolean {
		return 0 <= xy.x && xy.x < this.width && 0 <= xy.y && xy.y < this.height;
	}

	addObject(obj:MapObject, pos:XY) {
		obj.setParent(this);
		obj.moved(pos);
		this.objects.set(xy2id(pos), obj);
	}
	removeObject(obj:MapObject) {
		this.objects.delete(xy2id(obj.pos), obj);
		obj.removeParent();
	}
	moveObject(obj:MapObject, newPos:XY) {
		let oldPos = obj.pos;
		this.objects.delete(xy2id(oldPos), obj);
		obj.moved(newPos);
		this.objects.set(xy2id(newPos), obj);
	}

	objectsAt(xy:XY):MapObject[] {
		return this.objects.get(xy2id(xy));
	}
	tileAt(xy:XY):Tile {
		return this.tiles[this.xy2i(xy.x,xy.y)];
	}
	cellAt(xy:XY):Cell {
		return {
			xy,
			tile: this.tileAt(xy),
			mobjs: this.objectsAt(xy)
		}
	}
	cells():Cell[] {
		let result = [];
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				result.push(this.cellAt({x,y}));
			}
		}
		return result;
	}
	isEmpty(pos: XY) {
		return this.tileAt(pos).walk && !this.objectsAt(pos).some(mobj=>!mobj.walkable);
	}

	// Drawing utils

	filteredCells(filter:(cell:Cell)=>boolean):Cell[] {
		return this.cells().filter(cell=>filter(cell));
	}
	randomCell(rng:Random):XY;
	randomCell(rng:Random, filter?:(cell:Cell)=>boolean):XY|undefined;
	randomCell(rng:Random, filter?:(cell:Cell)=>boolean):XY|undefined {
		if (!filter) {
			return {
				x: rng.nextInt(this.width),
				y: rng.nextInt(this.height)
			}
		}
		return rng.pickOrUndefined(this.filteredCells(filter))?.xy;
	}
	randomEmptyCell(rng:Random):XY|undefined {
		return this.randomCell(rng, cell=>this.isEmpty(cell.xy));
	}

	setTile(xy:XY, tile:Tile) {
		this.tiles[this.xy2i(xy.x,xy.y)] = tile;
	}

	/**
	 * @param xy1 Top left corner
	 * @param xy2 Bottom right cornet
	 * @param tile Tile to fill with
	 */
	fillRect(xy1:XY, xy2:XY, tile:Tile) {
		let x1 = coerce(xy1.x, 0, this.width-1);
		let x2 = coerce(xy2.x, 0, this.width-1);
		let y1 = coerce(xy1.y, 0, this.height-1);
		let y2 = coerce(xy2.y, 0, this.height-1);
		for (let y = y1; y <= y2; y++) {
			let i  = this.xy2i(x1, y);
			for (let x = x1; x <= x2; x++, i++) {
				this.tiles[i] = tile;
			}
		}
	}
}
