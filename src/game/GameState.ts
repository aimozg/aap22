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
import {LevelExit} from "./objects/LevelExit";
import {LogManager} from "../utils/logging/LogManager";

let logger = LogManager.loggerFor("GameState");

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
		logger.info("World seed {}", seed);
		this.seed = seed;
		this.rng = XorWowRandom.create(seed,0);
		this.maprng = XorWowRandom.create(this.rng.nextInt(),this.rng.nextInt());

		this.roundNo = 1;
		this.tickNo = 0;

		while (true) {
			this.level = ChunkMapGen.generateLevel(
				this.maprng,
				40,
				40,
				dungeonChunks
			);
			if (this.level.rooms.length > 5) break;
		}
		let rooms = this.level.rooms.slice();
		let pcroom = this.maprng.randpop(rooms);
		this.player = new Player();
		this.level.addObject(this.player, pcroom.randomEmptyCell(this.maprng)!.xy);

		let exitroom = this.maprng.pick(rooms);
		let exitcell = this.level.cellAt(exitroom.center());
		if (!exitcell.isEmpty) exitcell = exitroom.randomEmptyCell(this.maprng)!;
		this.level.addObject(new LevelExit(), exitcell.xy);

		for (let room of rooms) {
			let cell = room.randomEmptyCell(this.maprng);
			if (!cell) {
				logger.warn("No empty cells in room {}",room);
			} else {
				this.level.addObject(
					new Creature(
						this.maprng.either(MonsterLib.Zombie, MonsterLib.Skeleton),
						new MonsterAI()),
					cell!.xy
				);
			}
		}

		Game.screenManager.log("{1;Game started!} Use arrow keys or numpad to move. ");
	}
}
