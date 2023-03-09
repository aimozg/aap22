/*
 * Created by aimozg on 06.03.2023.
 */

import {Level, Room} from "../core/Level";
import {Tile, Tiles} from "../core/Tile";
import {Side, sideCoords, SideID, SideList, xyPlusDir} from "../../utils/grid/grid";
import {XY, XYRect} from "../../utils/grid/geom";
import {Random} from "../../utils/math/Random";
import {cleanupTiles, layoutSymmetricalVariants} from "./utils";

export type ChunkType = "room" | "corridor"

export interface ChunkDef {
	layout: string;
	chance?: number;
	type?: ChunkType;
}

export type ChunkPlaceableDef = "door";
export type ChunkTileDef = [Tile, ...ChunkPlaceableDef[]];
export type ChunkMappingEntry =
	ChunkTileDef |
	["either", ...ChunkTileDef[]];
/**
 * ```
 * `.` floor           `#`: wall
 * `/` door (internal)
 * `=` water           `~`: lava
 * `|` wall, collapsed wall, or floor
 * Exits:
 * `:` floor exit
 * `+` door exit
 * `*` floor/door exit
 * ```
 */
export let ChunkMappings: Record<string, ChunkMappingEntry> = {
	'=': [Tiles.water],
	'~': [Tiles.lava],
	'#': [Tiles.wall],
	'|': ["either", [Tiles.floor], [Tiles.wall], [Tiles.collapsed_wall]],
	'.': [Tiles.floor],
	':': [Tiles.floor],
	'/': [Tiles.door_closed],//[Tiles.floor, "door"],
	'+': [Tiles.door_closed],//[Tiles.floor, "door"],
	'*': ["either", [Tiles.floor], [Tiles.door_closed]],
	'_': [Tiles.nothing],
};

export let ChunkExits = new Set<ChunkMappingEntry>(
	['*', ':', '+'].map(e=>ChunkMappings[e])
);

export interface Chunk {
	width: number;
	height: number;
	rect: XYRect;
	type: ChunkType;
	chance: number;
	layout: ChunkMappingEntry[][];
	exits: Record<SideID, XY[]>;
}

export interface ChunkJoin {
	chunk: Chunk;
	exit: XY;
}

export class ChunkSet {
	constructor(input: ChunkDef[]) {
		this.chunks = [];
		this.joins  = {
			U: [],
			D: [],
			L: [],
			R: []
		};
		for (let inputChunk of input) {
			let layout0  = inputChunk.layout.trim().split('\n').map(s => s.trim());
			for (let layout of layoutSymmetricalVariants(layout0)) {
				let width        = layout[0].length;
				let height       = layout.length;
				let chunk: Chunk = {
					layout: layout.map(row =>
						row.split('').map(char => ChunkMappings[char])
					),
					width: width,
					height: height,
					type: inputChunk.type ?? "room",
					chance: inputChunk.chance ?? 1,
					rect: XYRect.fromWH(width, height),
					exits: {
						U: [],
						D: [],
						L: [],
						R: []
					}
				};
				for (let side of SideList) {
					for (let xy of sideCoords(side, chunk.rect)) {
						if (ChunkExits.has(chunk.layout[xy.y][xy.x])) {
							chunk.exits[side.id].push(xy);
							this.joins[side.opposite].push({
								chunk: chunk,
								exit: xy
							})
						}
					}
				}
				this.chunks.push(chunk);
			}
		}
	}

	chunks: Chunk[];
	joins: Record<SideID, ChunkJoin[]>;
}
function joinWeight(t1:ChunkType, t2:ChunkType):number {
	if (t1 !== t2) return 2;
	if (t1 === "corridor") return 1.5;
	return 1;
}

export namespace ChunkMapGen {

	export function generateLevel(
		rng: Random,
		width: number,
		height: number,
		library: ChunkSet
	): Level {
		let level = new Level(width,height);
		let busymap = new Int8Array(width*height);
		const ttNothing = Tiles.nothing;
		type Exit = {xy:XY,side:Side,type:ChunkType};
		let exits:Exit[] = [];
		let badExits:Exit[] = [];
		let fluid = rng.either(Tiles.water, Tiles.lava);
		function placeChunk(chunk:Chunk,x0:number,y0:number) {
			if (chunk.type === "room") {
				level.rooms.push(
					new Room(level,
						{x: x0+chunk.rect.x1, y: y0+chunk.rect.y1},
						{x: x0+chunk.rect.x2, y: y0+chunk.rect.y2}
					)
				);
			}
			// Add exits to the queue
			for (let side of SideList) {
				for (let exit of chunk.exits[side.id]) {
					let xy      = XY.shift(exit,x0,y0);
					if (level.contains(xy)) {
						let exit = {xy, side, type: chunk.type};
						if (level.tileAt(xy) === ttNothing) {
							exits.push(exit);
						} else {
							badExits.push(exit);
						}
					}
				}
			}
			// Draw the chunk
			for (let y = 0; y < chunk.height; y++) {
				for (let x = 0; x < chunk.width; x++) {
					let cl  = chunk.layout[y][x];
					let ch  = (cl[0] === "either") ? rng.pick(cl.slice(1) as ChunkTileDef[]) : cl as ChunkTileDef;
					let tile = ch[0];
					if (tile === ttNothing) continue;
					if (tile === Tiles.water) tile = fluid;
					let mx = x + x0, my = y + y0;
					let bi = level.xy2i(mx,my);
					busymap[bi] = 2;
					// TODO placeables
					level.cells[bi].tile = tile;
				}
			}
		}
		function canPlaceChunk(chunk:Chunk,side:SideID,x0:number,y0:number) {
			if (!level.contains({x:x0,y:y0})) return false;
			if (!level.contains({x:x0+chunk.width-1,y:y0+chunk.height-1})) return false;
			let x1 = side === 'R' ? 1 : 0;
			let x2 = side === 'L' ? chunk.width-2 : chunk.width-1;
			let y1 = side === 'D' ? 1 : 0;
			let y2 = side === 'U' ? chunk.height-2 : chunk.height-1;
			for (let x = x1; x <= x2; x++) {
				for (let y = y1; y <= y2; y++) {
					let mx = x+x0;
					let my = y+y0;
					let bi = level.xy2i(mx,my);
					if (busymap[bi] === 2) return false;
				}
			}
			return true;
		}

		let initialChunk = rng.pick(library.chunks.filter(c=>c.type==="room"));
		let ix0 = (width+initialChunk.width)/2|0;
		let iy0 = (height+initialChunk.height)/2|0;
		while (ix0+initialChunk.width >= width) ix0--;
		while (iy0+initialChunk.height >= height) iy0--;
		placeChunk(initialChunk,ix0,iy0);

		while (exits.length > 0) {
			let exit = rng.randpop(exits);
			let fail = true;
			let nextxy = xyPlusDir(exit.xy, exit.side.id);
			if (level.contains(nextxy) && level.tileAt(nextxy) === ttNothing) {
				let joins = library.joins[exit.side.id].slice();
				while (joins.length > 0) {
					let join = rng.pickWeighted(joins, j=>
						j.chunk.chance*joinWeight(j.chunk.type,exit.type));
					joins.remove(join);
					// Topleft corner of new chunk
					let px = exit.xy.x - join.exit.x;
					let py = exit.xy.y - join.exit.y;
					if (canPlaceChunk(join.chunk, exit.side.id, px, py)) {
						placeChunk(join.chunk, px, py);
						fail = false;
						break;
					}
				}
			}
			if (fail) {
				badExits.push(exit);
			}
		}
		for (let exit of badExits) {
			// Failed to place the chunk = fill the exit tile with wall
			let nextxy = xyPlusDir(exit.xy, exit.side.id);
			let nexttile = level.tileAt(nextxy);
			if (nexttile === ttNothing || level.count8(exit.xy, ttNothing)>0) {
				level.setTile(exit.xy, Tiles.wall);
			} else if (level.tileAt(exit.xy) === Tiles.door_closed) {
				if (nexttile === Tiles.wall) {
					level.setTile(exit.xy, Tiles.wall);
				}
			}
		}

		cleanupTiles(level);

		return level;
	}
}
