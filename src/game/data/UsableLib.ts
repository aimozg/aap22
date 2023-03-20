/*
 * Created by aimozg on 20.03.2023.
 */

import {ItemBlueprint} from "../core/Item";
import Chars from "../../utils/ui/chars";
import {Creature} from "../core/Creature";
import {Game} from "../Game";
import {Colors} from "../../utils/ui/canvas";

export namespace UsableLib {
	export let smallHealingPotion: ItemBlueprint = {
		bpid: "ptn_healsm",
		name: "small health potion",
		ch: Chars.INVERSE_EXCLAMATION,
		color: Colors.GREEN,
		usable: {
			onUse(actor: Creature) {
				let rng = Game.state.rng;
				Game.gameController.doHeal(actor, rng.nextInt(5,10));
			},
			canUse(actor: Creature): boolean {
				return actor.hp < actor.hpMax;
			}
		}
	}
}
