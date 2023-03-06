/*
 * Created by aimozg on 06.03.2023.
 */

import {CreaturePrototype} from "../core/Creature";
import {Colors} from "../../utils/ui/canvas";

export namespace MonsterLib {
	export let Zombie:CreaturePrototype = {
		name: "zombie",
		ch: 'z',
		color: Colors.BROWN,

		hp: 10,
		aim: 50,
		dodge: 0,
	}
}
