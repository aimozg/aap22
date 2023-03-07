import Chars from "../../utils/ui/chars";
import {Creature} from "./Creature";
import {Colors} from "../../utils/ui/canvas";

export class Player extends Creature {
	constructor() {
		super({
			name: "Hero",
			ch: Chars.SMILE_BLACK,
			color: Colors.LIGHTYELLOW,
			tags: ["player"],

			speed: 4,
			hp: 20,
			aim: 85,
			damage: 10,
			dodge: 10,
		});
	}
	faction = "player";
}
