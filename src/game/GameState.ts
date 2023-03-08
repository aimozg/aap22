/*
 * Created by aimozg on 04.03.2023.
 */


import {Level} from "./core/Level";
import {Player} from "./core/Player";
import {Random} from "../utils/math/Random";
import {XorWowRandom} from "../utils/math/XorWowRandom";
import {Game} from "./Game";
import {LogManager} from "../utils/logging/LogManager";

let logger = LogManager.loggerFor("GameState");

export let GameState = new class {

	seed: number;
	level: Level;
	vismap: Int8Array;
	player: Player;
	rng: Random;
	maprng: Random;
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

		GameState.player = new Player();

		Game.gameController.newLevel();

		Game.screenManager.log("{1;Game started!} Use arrow keys or numpad to move. ");
	}
}
