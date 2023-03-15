/*
 * Created by aimozg on 11.03.2023.
 */

import {ItemBlueprint} from "../core/Item";
import Chars from "../../utils/ui/chars";

export namespace WeaponLib {

	export let dagger: ItemBlueprint     = {
		bpid: "wpn_dagger",
		name: "dagger",
		ch: '/',
		weapon: {
			damage: 6
		}
	};
	export let sword: ItemBlueprint      = {
		bpid: "wpn_sword",
		name: "sword",
		ch: '\\',
		weapon: {
			damage: 12
		}
	};
	export let greatsword: ItemBlueprint = {
		bpid: "wpn_greatsword",
		name: "greatsword",
		ch: Chars.DAGGER,
		weapon: {
			damage: 18
		}
	};
}
