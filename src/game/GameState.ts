/*
 * Created by aimozg on 04.03.2023.
 */


import {Level} from "./core/Level";
import {Tiles} from "./core/Tile";
import {Player} from "./core/Player";
import {Random} from "../utils/math/Random";
import {XorWowRandom} from "../utils/math/XorWowRandom";
import {Creature} from "./core/Creature";

export let GameState = new class {

	level: Level;
	player: Player;
	rng: Random;
	maprng: Random;

	get mapWidth() { return this.level.width }

	get mapHeight() { return this.level.height }

	resetGame() {
		this.rng = XorWowRandom.create();
		this.maprng = XorWowRandom.create();

		this.level  = new Level(120, 40);
		this.level.fillRect({x: 0, y: 0}, {x: this.level.width, y: this.level.height}, Tiles.floor);

		this.player = new Player();
		this.level.addObject(this.player, this.level.randomEmptyCell(this.maprng)!);

		this.level.addObject(new Creature({
			name: "zombie",
			ch: 'z',
			color: '#774400'
		}), this.level.randomEmptyCell(this.maprng)!);

		for (let i = 0; i < 10 + this.maprng.nextInt(10); i++) {
			let xy = this.level.randomCell(this.maprng);
			if (this.level.isEmpty(xy)) {
				this.level.setTile(xy, Tiles.wall);
			}
		}
	}
}
