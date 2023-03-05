/*
 * Created by aimozg on 05.03.2023.
 */

import {GameState} from "./GameState";
import {XY} from "../utils/geom";
import {Creature} from "./core/Creature";

export let GameController = new class {

	setup() {}

	get playerCanAct():boolean {
		return true;
	}

	doStep(creature:Creature, newPos:XY) {
		creature.setPos(newPos);
	}

	tryPlayerStep(dx: number, dy: number):boolean {
		let player = GameState.player,
			level = GameState.level;
		let pos2 = XY.shift(player.pos, dx, dy);
		if (!level.contains(pos2)) return false;
		if (!level.isEmpty(pos2)) return false;
		this.doStep(player, pos2);
		return true;
	}
}
