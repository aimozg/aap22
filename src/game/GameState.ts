/*
 * Created by aimozg on 04.03.2023.
 */


import {Level} from "./core/Level";
import {Player} from "./core/Player";
import {Random} from "../utils/math/Random";
import {XorWowRandom} from "../utils/math/XorWowRandom";
import {Creature} from "./core/Creature";
import {MonsterAI} from "./monster/MonsterAI";
import {MonsterLib} from "./data/MonsterLib";
import {Game} from "./Game";
import {ChunkMapGen} from "./mapgen/ChunkMapGen";
import {dungeonChunks} from "./mapgen/dungeonChunks";

export let GameState = new class {

	seed: number;
	level: Level;
	player: Player;
	rng: Random;
	maprng: Random;
	roundNo: number;
	tickNo: number; // 1 round = 4 ticks

	get mapWidth() { return this.level.width }

	get mapHeight() { return this.level.height }

	resetGame(seed?:number) {
		seed ??= (Math.random()*1_000_000|0);
		this.seed = seed;
		this.rng = XorWowRandom.create(seed,0);
		this.maprng = XorWowRandom.create(this.rng.nextInt(),this.rng.nextInt());

		this.roundNo = 1;
		this.tickNo = 0;

		this.level  = ChunkMapGen.generateLevel(
			this.maprng,
			40,
			40,
			dungeonChunks
		);

		this.player = new Player();
		this.level.addObject(this.player, this.level.randomEmptyCell(this.maprng)!);

		this.level.addObject(
			new Creature(MonsterLib.Zombie, new MonsterAI()),
			this.level.randomEmptyCell(this.maprng)!
		);

		Game.screenManager.log("{1;Game started!} Use arrow keys or numpad to move. ");
	}
}
