/*
 * Created by aimozg on 05.03.2023.
 */

import {Creature} from "../core/Creature";
import {EntityEffect} from "../Entity";
import {GameController} from "../GameController";
import {GameState} from "../GameState";
import {Dir8List, dir8to} from "../../utils/grid";
import {checkLineOfSight} from "../../utils/los";
import {XY} from "../../utils/geom";
import {LogManager} from "../../utils/logging/LogManager";

export type AIState = "disabled"|"idle"|"hunt";

let logger = LogManager.loggerFor("MonsterAI");

export class MonsterAI extends EntityEffect<Creature> {

	constructor(
		public state: AIState = "idle"
	) {super();}

	target: Creature|null = null;
	execute() {
		logger.debug("execute {} {}",this.host, this.state);
		let gc = GameController, me = this.host!;
		switch (this.state) {
			case "disabled":
				gc.actSkip(me);
				break;
			case "idle": {
				let target = GameState.player;
				if (target.isAlive && checkLineOfSight(GameState.level, target.pos, me.pos)) {
					logger.debug("can see player - switch to hunt");
					this.state  = "hunt";
					this.target = target;
					this.execute()
					return;
				}
				let dir = GameState.rng.pick(Dir8List);
				if (!gc.actSmart(me, dir.dx, dir.dy)) {
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
				let dir = dir8to(me.pos, target.pos);
				if(!gc.actSmart(me, dir.dx, dir.dy)) {
					gc.actSkip(me);
				}
				break;
			}
		}
	}
}
