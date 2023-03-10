/*
 * Created by aimozg on 11.03.2023.
 */

import {ItemDef} from "../core/Item";
import Chars from "../../utils/ui/chars";

export namespace WeaponLib {

	export let dagger: ItemDef = {
		name: "dagger",
		ch: '/',
		weapon: {
			damage: 6
		}
	};
	export let sword: ItemDef = {
		name: "sword",
		ch: '\\',
		weapon: {
			damage: 12
		}
	};
	export let greatsword: ItemDef = {
		name: "greatsword",
		ch: Chars.DAGGER
	};
}
