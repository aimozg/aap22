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

		level: 1,
		speed: 3,
		hp: 5,
		aim: 50,
		damage: 4,
		dodge: 0,
	};
	export let Skeleton:CreaturePrototype = {
		name: "skeleton",
		ch: 's',
		color: Colors.WHITE,
		tags: ["undead","bones"],

		level: 1,
		speed: 4,
		hp: 3,
		aim: 85,
		damage: 2,
		dodge: 15
	};
}
