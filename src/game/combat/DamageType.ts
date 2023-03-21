/*
 * Created by aimozg on 06.03.2023.
 */

import {Colors} from "../../utils/ui/canvas";

export interface DamageType {
	name: string;
	cls: string;
	color: string;
}

export let DamageTypes = {
	PHYSICAL: {
		name: "physical",
		cls: "orange",
		color: Colors.ORANGE
	},
	FIRE: {
		name: "fire",
		cls: "red",
		color: Colors.RED
	}
} satisfies Record<string,DamageType>;

