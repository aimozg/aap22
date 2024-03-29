/*
 * Created by aimozg on 05.03.2023.
 */

import {Creature} from "../core/Creature";
import {GameController} from "../GameController";
import {Dir8List, xyPlusDir} from "../../utils/grid/grid";
import {checkLineOfSight} from "../../utils/grid/los";
import {XY} from "../../utils/grid/geom";
import {LogManager} from "../../utils/logging/LogManager";
import {findGradient} from "../../utils/grid/dijkstra";
import {ObjectComponent} from "../ecs/ObjectComponent";
import {EntityJson} from "../ecs/EntityLoader";
import {UUID} from "../ecs/utils";
import {EntityData, EntityReference} from "../ecs/decorators";
import {EntityClassLoader} from "../ecs/EntityClassLoader";
import {Game} from "../Game";

export type AIState = "disabled" | "idle" | "hunt";

let logger = LogManager.loggerFor("MonsterAI");

export class MonsterAI extends ObjectComponent<Creature> {
	static readonly CLSID = "MonsterAI";
	constructor(
		uuid: number = UUID()
	) {
		super(MonsterAI.CLSID, null, uuid);
	}
	@EntityReference()
	target: Creature|null = null;
	@EntityData()
	state: AIState = "idle";

	execute() {
		logger.debug("execute {} {}",this.parentEntity, this.state);
		let gc = GameController, me = this.parentEntity!, level = Game.state.level;
		switch (this.state) {
			case "disabled":
				gc.actSkip(me);
				break;
			case "idle": {
				let target = Game.state.player;
				if (target.isAlive && checkLineOfSight(level, target.pos, me.pos)) {
					logger.debug("can see player - switch to hunt");
					this.state  = "hunt";
					this.target = target;
					this.execute()
					return;
				}
				let dir = Game.state.rng.pick(Dir8List);
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
				if (XY.adjacent8(me.pos, target.pos)) {
					gc.actMeleeAttack(me, target);
					return;
				}
				let dir = findGradient(Game.state.approachPlayerMap, level.width, level.height, me.pos, 8, true);
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
	static Loader:EntityClassLoader<MonsterAI> = {
		clsid: MonsterAI.CLSID,
		create(e: EntityJson): MonsterAI {
			return new MonsterAI(e.uuid);
		}
	}
}
