/*
 * Created by aimozg on 06.03.2023.
 */

import {Colors} from "../../utils/ui/canvas";

export interface DamageType {
	name: string;
	cls: string;
	color: string;
}

export namespace DamageTypes {
	export let PHYSICAL: DamageType = {
		name: "physical",
		cls: "orange",
		color: Colors.ORANGE
	};
	export let FIRE: DamageType = {
		name: "fire",
		cls: "red",
		color: Colors.RED
	}
}

