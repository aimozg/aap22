/*
 * Created by aimozg on 06.03.2023.
 */

import {Colors} from "../../utils/ui/canvas";
import {MonsterBlueprint} from "../core/Monster";

export namespace MonsterLib {
	export let Zombie:MonsterBlueprint   = {
		bpid: "zombie",
		name: "zombie",
		ch: 'z',
		color: Colors.BROWN,
		tags: ["undead"],
		stats: {
			level: 1,
			speed: 3,
			hpMax: 5,
			naturalAim: 50,
			naturalDamage: 4,
			naturalDodge: 0
		},
	};
	export let Skeleton:MonsterBlueprint = {
		bpid: "skeleton",
		name: "skeleton",
		ch: 's',
		color: Colors.WHITE,
		tags: ["undead","bones"],
		stats: {
			level: 1,
			speed: 4,
			hpMax: 3,
			naturalAim: 85,
			naturalDamage: 2,
			naturalDodge: 15
		}
	};
}
