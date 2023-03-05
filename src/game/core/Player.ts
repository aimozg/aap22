import Chars from "../../utils/ui/chars";
import {Creature} from "./Creature";

export class Player extends Creature {
	constructor() {
		super({
			name: "Hero",
			ch: Chars.SMILE_BLACK,
			color: '#ffff00'
		});
	}
}
