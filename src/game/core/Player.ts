import Chars from "../../utils/ui/chars";
import {Creature} from "./Creature";
import {Colors} from "../../utils/ui/canvas";

export class Player extends Creature {
	constructor() {
		super({
			name: "Hero",
			ch: Chars.SMILE_BLACK,
			color: Colors.LIGHTYELLOW,

			hp: 20,
			aim: 85,
			dodge: 10,
		});
	}
}
