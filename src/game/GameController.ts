/*
 * Created by aimozg on 05.03.2023.
 */

import {GameState} from "./GameState";
import {XY} from "../utils/geom";
import {Creature} from "./core/Creature";
import {Player} from "./core/Player";
import {LogManager} from "../utils/logging/LogManager";
import {MonsterAI} from "./monster/MonsterAI";

let logger = LogManager.loggerFor("game.GameController");

export let GameController = new class {

	setup() {}

	//---------//
	// HELPERS //
	//---------//

	playerCanAct = false;

	//------//
	// CORE //
	//------//

	initLevel() {
		for (let creature of GameState.level.creatures()) {
			creature.ap = creature.speed;
		}
	}

	update() {
		this.playerCanAct = false;
		for (let creature of GameState.level.creatures()) {
			if (creature.canAct()) {
				if (creature instanceof Player) {
					this.playerCanAct = true;
				} else {
					this.doAI(creature);
				}
				return;
			}
		}
		this.nextTick();
	}
	nextTick() {
		GameState.tickNo++;
		if (GameState.tickNo >= 4) {
			this.roundEnd();
		}
		this.tick();
	}

	tick() {
		logger.debug("tick {}.{}", GameState.roundNo, GameState.tickNo);
		for (let creature of GameState.level.creatures()) {
			this.tickCreature(creature);
		}
	}

	roundStart() {
		logger.info("roundStart {}", GameState.roundNo);
	}
	roundEnd() {
		GameState.tickNo = 0;
		GameState.roundNo++;
		this.roundStart();
	}
	tickCreature(creature:Creature) {
		creature.ap++;
	}

	doAI(creature:Creature) {
		logger.info("doAI {}", creature);
		let ai = creature.findEffect(MonsterAI);
		if (!ai) {
			logger.warn("creature {} has no AI", creature);
			this.doSkip(creature);
		} else {
			ai.execute();
		}
	}

	smartAction(creature:Creature, dx:number, dy:number):boolean {
		logger.debug("smartAction {} {} {}", creature, dx, dy);
		let level = GameState.level;
		let pos2 = XY.shift(creature.pos, dx, dy);
		if (!level.contains(pos2)) return false;
		if (!level.isEmpty(pos2)) return false;
		this.doStep(creature, pos2);
		return true
	}
	doStep(creature:Creature, newPos:XY) {
		logger.info("doStep {}", creature, newPos);
		creature.ap = 0;
		creature.setPos(newPos);
	}
	doSkip(creature:Creature) {
		logger.info("doSkip {}", creature);
		creature.ap = 0;
	}
	doMeleeAttack(actor:Creature, target:Creature) {
		// TODO
	}

	//---------//
	// ACTIONS //
	//---------//

	playerSmartAction(dx: number, dy: number):boolean {
		logger.debug("playerSmartAction {} {}", dx, dy);
		if (!this.playerCanAct) return false;
		return this.smartAction(GameState.player, dx, dy);
	}
}
