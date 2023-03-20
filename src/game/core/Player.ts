import Chars from "../../utils/ui/chars";
import {Creature} from "./Creature";
import {Colors} from "../../utils/ui/canvas";
import {UUID} from "../ecs/utils";
import {EntityClassLoader} from "../ecs/EntityClassLoader";
import {EntityJson} from "../ecs/EntityLoader";
import {BaseStats} from "../ecs/decorators";

@BaseStats({
	level: 1,
	speed: 4,
	hpMax: 20,
	naturalAim: 85,
	naturalDamage: 4,
	naturalDodge: 10
})
export class Player extends Creature {
	static readonly CLSID = "Player";
	constructor(uuid:number = UUID()) {
		super(Player.CLSID, null, uuid);
		this.name = "Hero";
		this.color = Colors.LIGHTYELLOW;
		this.glyph.ch = Chars.SMILE_WHITE;
		this.glyph.fg = this.color;
		this.tags.add("player");
		this.hp = this.hpMax;
	}
	faction = "player";

	static Loader:EntityClassLoader<Player> = {
		clsid: Player.CLSID,
		create(e: EntityJson): Player {
			return new Player(e.uuid);
		}
	}
}
