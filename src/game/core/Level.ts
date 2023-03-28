/*
 * Created by aimozg on 05.03.2023.
 */

import {ChildGameObject, GameObject} from "../ecs/GameObject";
import {MultiMap} from "../../utils/MultiMap";
import {MapObject} from "./MapObject";
import {XY, XYRect} from "../../utils/grid/geom";
import {createArray} from "../../utils/collections";
import {Tile, Tiles} from "./Tile";
import {coerce} from "../../utils/math/utils";
import {Random} from "../../utils/math/Random";
import {GlyphData} from "../../utils/ui/GlyphLayer";
import {Creature} from "./Creature";
import {Dir4List, Dir8List, xyPlusDir} from "../../utils/grid/grid";
import {LosProvider} from "../../utils/grid/los";
import {UUID} from "../ecs/utils";
import {EntityClassLoader} from "../ecs/EntityClassLoader";
import {EntityJson} from "../ecs/EntityLoader";
import {EntityData} from "../ecs/decorators";
import {Type} from "../../utils/types";

export class Cell {
	constructor(
		public readonly level: Level,
		public readonly xy: XY
	) {}

	tile: Tile = Tiles.nothing;

	placeObject(mobj: MapObject) {
		this.level.addObject(mobj, this.xy);
	}

	get objects(): MapObject[] {
		return this.level.objectsAt(this.xy);
	}
	objectOfType<T extends MapObject>(klass:Type<T>):T|undefined {
		return this.level.mobjAt(this.xy,klass);
	}

	get isEmpty(): boolean {
		return this.tile.walk && !this.objects.some(mobj => !mobj.walkable);
	}

	get glyph(): GlyphData {
		return this.topMobj()?.glyph ?? this.tile;
	}

	topMobj(): MapObject | undefined {
		return this.objects.maxOn("z");
	}
}

export class Room extends XYRect {
	constructor(
		public readonly level: Level,
		topLeft: XY,
		bottomRight: XY
	) {
		super(topLeft.x,topLeft.y,bottomRight.x,bottomRight.y)
	}

	toString() {
		return `[Room (${this.x1};${this.y1};${this.x2};${this.y2})]`
	}

	cells():Cell[] {
		return this.mapXY(xy=>this.level.cellAt(xy));
	}
	cellAtLocal(xy:XY):Cell {
		return this.level.cellAt(XY.add(xy, this.topLeft));
	}
	randomEmptyCell(rng:Random):Cell|undefined {
		return rng.pickOrUndefined(this.cells().filter(c=>c.isEmpty));
	}

	center():XY {
		return this.icenter();
	}
}

export interface LevelCustomData {
	width: number;
	height: number;
	tiles: number[];
}

export class Level extends GameObject implements LosProvider {
	static readonly CLSID = "Level";

	constructor(width: number,
	            height: number,
	            uuid: number = UUID()) {
		super(Level.CLSID, null, uuid);
		this.height = height;
		this.width  = width;
		this.cells  = createArray(this.width * this.height, (i) =>
			new Cell(this, this.i2xy(i)));
		this.rect   = XYRect.fromWHint(this.width, this.height)
	}

	@EntityData()
	public readonly width: number;
	@EntityData()
	public readonly height: number;
	readonly mobjmap = new MultiMap<number, MapObject>()
	readonly cells: Cell[];
	readonly rooms: Room[] = [];
	readonly rect:XYRect;
	saveChildren(): ChildGameObject[] {
		return this.mobjmap.map(obj=>[this.xy2i(obj.pos.x,obj.pos.y),obj]);
	}
	loadChild(pos: number, child: GameObject) {
		if (child instanceof MapObject) {
			this.addObject(child, this.i2xy(pos));
		}
	}

	loadCustomData(data: LevelCustomData): void {
		data.tiles .forEach((tile,i)=>{
			this.cells[i].tile = Tiles.byId(tile);
		})
	}

	saveCustomData(data: LevelCustomData): void {
		data.tiles = this.cells.map(cell=>cell.tile.id);
	}


	i2xy(i: number): XY {
		return {x: (i % this.width), y: (i / this.width) | 0};
	}

	// TODO move to XYRect or Array2D
	xy2i(x: number, y: number): number {
		return y * this.width + x;
	}

	//-----------//
	// ACCESSORS //
	//-----------//
	objects(): MapObject[] {
		return this.mobjmap.values();
	}

	creatures(): Creature[] {
		return this.objects().filter((mobj): mobj is Creature => mobj instanceof Creature);
	}

	cellAt(xy: XY): Cell {
		return this.cells[this.xy2i(xy.x, xy.y)];
	}

	tileAt(xy: XY): Tile {
		if (!this.contains(xy)) return Tiles.nothing;
		return this.cellAt(xy).tile;
	}

	objectsAt(xy: XY): MapObject[] {
		return this.mobjmap.get(this.xy2i(xy.x,xy.y));
	}

	creatureAt(xy: XY): Creature | undefined {
		return this.mobjAt(xy,Creature);
	}

	mobjAt<T extends MapObject>(xy: XY, klass: Type<T>): T | undefined {
		return this.objectsAt(xy).find((mobj): mobj is T => mobj instanceof klass);
	}

	isEmpty(xy: XY) {
		return this.cellAt(xy).isEmpty;
	}

	contains(xy: XY): boolean {
		return 0 <= xy.x && xy.x < this.width && 0 <= xy.y && xy.y < this.height;
	}

	seeThrough(xy: XY): boolean {
		return this.cells[this.xy2i(xy.x,xy.y)].tile.vision
	}

	get cleared():boolean {
		return !this.mobjmap.some(e=>e instanceof Creature && e.faction !== "player");
	}

	//-----------//
	// MODIFIERS //
	//-----------//
	addObject(obj: MapObject, pos: XY) {
		obj.setParentObject(this);
		obj.moved(pos);
		this.mobjmap.set(this.xy2i(obj.pos.x, obj.pos.y), obj);
	}
	removeObject(obj: MapObject) {
		obj.setParentObject(null);
		this.mobjmap.delete(this.xy2i(obj.pos.x, obj.pos.y), obj);
	}
	moveObject(obj: MapObject, newPos: XY) {
		if (obj.parentEntity !== this) throw new Error(`Bad parent ${obj.parentEntity}`);
		let oldPos = obj.pos;
		this.mobjmap.delete(this.xy2i(oldPos.x,oldPos.y), obj);
		obj.moved(newPos);
		this.mobjmap.set(this.xy2i(newPos.x,newPos.y), obj);
	}

	//---------------//
	// DRAWING UTILS //
	//---------------//

	filteredCells(filter: (cell: Cell) => boolean): Cell[] {
		return this.cells.filter(cell => filter(cell));
	}

	randomCell(rng: Random): XY;
	randomCell(rng: Random, filter?: (cell: Cell) => boolean): XY | undefined;
	randomCell(rng: Random, filter?: (cell: Cell) => boolean): XY | undefined {
		if (!filter) {
			return {
				x: rng.nextInt(this.width),
				y: rng.nextInt(this.height)
			}
		}
		return rng.pickOrUndefined(this.filteredCells(filter))?.xy;
	}

	randomEmptyCell(rng: Random): XY | undefined {
		return this.randomCell(rng, cell => this.isEmpty(cell.xy));
	}

	setTile(xy: XY, tile: Tile) {
		this.cellAt(xy).tile = tile;
	}

	neighbours4(xy:XY):XY[] {
		let result:XY[] = [];
		for (let dir of Dir4List) {
			let nxy = xyPlusDir(xy, dir);
			if (this.contains(nxy)) result.push(nxy);
		}
		return result;
	}
	neighbours8(xy:XY):XY[] {
		let result:XY[] = [];
		for (let dir of Dir8List) {
			let nxy = xyPlusDir(xy, dir);
			if (this.contains(nxy)) result.push(nxy);
		}
		return result;
	}
	/**
	 * Number of neighbour cells of specific tile type
	 */
	count8(xy:XY, tile:Tile):number {
		let n = 0;
		for (let dir of Dir8List) {
			let nxy = xyPlusDir(xy, dir);
			if (this.contains(nxy) && this.tileAt(nxy) === tile) n++;
		}
		return n;
	}

	/**
	 * @param xy1 Top left corner
	 * @param xy2 Bottom right cornet
	 * @param tile Tile to fill with
	 */
	fillRect(xy1: XY, xy2: XY, tile: Tile) {
		let x1 = coerce(xy1.x, 0, this.width - 1);
		let x2 = coerce(xy2.x, 0, this.width - 1);
		let y1 = coerce(xy1.y, 0, this.height - 1);
		let y2 = coerce(xy2.y, 0, this.height - 1);
		for (let y = y1; y <= y2; y++) {
			let i = this.xy2i(x1, y);
			for (let x = x1; x <= x2; x++, i++) {
				this.cells[i].tile = tile;
			}
		}
	}

	/**
	 * @param xy1 Top left corner
	 * @param xy2 Bottom right cornet
	 * @param tile Tile to draw with
	 */
	drawRect(xy1: XY, xy2: XY, tile: Tile) {
		let x1 = coerce(xy1.x, 0, this.width - 1);
		let x2 = coerce(xy2.x, 0, this.width - 1);
		let y1 = coerce(xy1.y, 0, this.height - 1);
		let y2 = coerce(xy2.y, 0, this.height - 1);
		for (let y = y1; y <= y2; y++) {
			this.setTile({x: x1, y}, tile);
			this.setTile({x: x2, y}, tile);
		}
		for (let x = x1 + 1; x < x2; x++) {
			this.setTile({x, y: y1}, tile);
			this.setTile({x, y: y2}, tile);
		}
	}

	/**
	 * Find cell nearest to start that satisfies conditions
	 * @param start
	 * @param ndir
	 * @param condition
	 * @param [passability] Return false to ignore a cell and its neighbours. By default all cells are passable.
	 */
	findNearestCell(start:XY,
	                ndir:4|8,
	                condition:(cell:Cell)=>boolean,
	                passability?:(cell:Cell)=>boolean):Cell|undefined {
		let queue = [start];
		while(queue.length>0) {
			let cell = this.cellAt(queue.shift()!);
			if (passability && !passability(cell)) continue;
			if (condition(cell)) return cell;
			queue.push(...(ndir===4?this.neighbours4(cell.xy):this.neighbours8(cell.xy)));
		}
		return undefined;
	}

	static Loader:EntityClassLoader<Level> = {
		clsid: Level.CLSID,
		create(e: EntityJson): Level {
			let data = e.data as LevelCustomData;
			return new Level(data.width, data.height, e.uuid);
		}
	}
}
