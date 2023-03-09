/*
 * Created by aimozg on 05.03.2023.
 */

import {Creature} from "../core/Creature";
import {EntityEffect} from "../Entity";
import {GameController} from "../GameController";
import {GameState} from "../GameState";
import {Dir8List, xyPlusDir} from "../../utils/grid/grid";
import {checkLineOfSight} from "../../utils/grid/los";
import {XY} from "../../utils/grid/geom";
import {LogManager} from "../../utils/logging/LogManager";
import {findGradient} from "../../utils/grid/dijkstra";

export type AIState = "disabled"|"idle"|"hunt";

let logger = LogManager.loggerFor("MonsterAI");

export class MonsterAI extends EntityEffect<Creature> {

	constructor(
		public state: AIState = "idle"
	) {super();}

	target: Creature|null = null;
	execute() {
		logger.debug("execute {} {}",this.host, this.state);
		let gc = GameController, me = this.host!, level = GameState.level;
		switch (this.state) {
			case "disabled":
				gc.actSkip(me);
				break;
			case "idle": {
				let target = GameState.player;
				if (target.isAlive && checkLineOfSight(level, target.pos, me.pos)) {
					logger.debug("can see player - switch to hunt");
					this.state  = "hunt";
					this.target = target;
					this.execute()
					return;
				}
				let dir = GameState.rng.pick(Dir8List);
				let targetPos = xyPlusDir(me.pos, dir);
				if (level.contains(targetPos) && level.isEmpty(targetPos)) {
					gc.actStep(me, targetPos)
				} else {
					gc.actSkip(me);
				}
				break;
			}
			case "hunt": {
				let target = this.target;
				if (!target?.isAlive) {
					logger.debug("target lost");
					this.state = 'idle';
					this.execute();
					return;
				}
				if (XY.adjacent(me.pos, target.pos)) {
					gc.actMeleeAttack(me, target);
					return;
				}
				let dir = findGradient(GameState.approachPlayerMap, level.width, level.height, me.pos, 8, true);
				if (dir) {
					if (!gc.actSmart(me, dir.dx, dir.dy)) {
						gc.actSkip(me);
					}
				} else {
					gc.actSkip(me);
				}
				break;
			}
		}
	}
}
