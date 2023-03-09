/*
 * Created by aimozg on 04.03.2023.
 */


import {Level} from "./core/Level";
import {Player} from "./core/Player";
import {Random} from "../utils/math/Random";
import {XorWowRandom} from "../utils/math/XorWowRandom";
import {LogManager} from "../utils/logging/LogManager";
import {Tiles} from "./core/Tile";

let logger = LogManager.loggerFor("GameState");

export let GameState = new class {

	seed: number;
	rng: Random;
	maprng: Random;

	depth: number;
	level: Level;
	vismap: Int8Array;
	approachPlayerMap: Int8Array;
	player: Player;

	roundNo: number;
	tickNo: number; // 1 round = 4 ticks

	get mapWidth() { return this.level.width }

	get mapHeight() { return this.level.height }

	resetGame(seed?:number) {
		seed ??= (Math.random()*1_000_000|0);
		logger.info("World seed {}", seed);
		this.seed = seed;
		this.rng = XorWowRandom.create(seed,0);
		this.maprng = XorWowRandom.create(this.rng.nextInt(),this.rng.nextInt());

		this.depth = 1;
		this.level = new Level(1,1);
		this.level.cells[0].tile = Tiles.floor;
		this.player = new Player();
		this.level.addObject(this.player, {x:0,y:0});
	}
}
