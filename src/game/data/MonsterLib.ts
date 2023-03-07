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
		tags: ["undead"],

		speed: 3,
		hp: 10,
		aim: 50,
		damage: 5,
		dodge: 0,
	};
	export let Skeleton:CreaturePrototype = {
		name: "skeleton",
		ch: 's',
		color: Colors.WHITE,
		tags: ["undead","bones"],

		speed: 4,
		hp: 5,
		aim: 85,
		damage: 5,
		dodge: 15
	};
}
