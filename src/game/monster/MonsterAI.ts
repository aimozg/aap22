/*
 * Created by aimozg on 05.03.2023.
 */

import {Creature} from "../core/Creature";
import {EntityEffect} from "../Entity";
import {GameController} from "../GameController";
import {GameState} from "../GameState";
import {Dir8List} from "../../utils/grid";

export type AIState = "disabled"|"idle"|"hunt";


export class MonsterAI extends EntityEffect<Creature> {

	constructor(
		public state: AIState = "idle"
	) {super();}

	execute() {
		let gc = GameController, me = this.host!;
		switch (this.state) {
			case "disabled":
				gc.doSkip(me);
				break;
			case "idle":
			case "hunt":
				let dir = GameState.rng.pick(Dir8List);
				gc.smartAction(me, dir.dx, dir.dy);
				break;
		}
	}
}
