import Chars from "../../utils/ui/chars";
import {Creature} from "./Creature";
import {Colors} from "../../utils/ui/canvas";
import {setObjectBaseValues, UUID} from "../ecs/utils";
import {EntityClassLoader} from "../ecs/EntityClassLoader";
import {EntityJson} from "../ecs/EntityLoader";

export class Player extends Creature {
	static readonly CLSID = "Player";
	constructor(uuid:number = UUID()) {
		super(Player.CLSID, null, uuid);
		this.name = "Hero";
		this.color = Colors.LIGHTYELLOW;
		this.glyph.ch = Chars.SMILE_WHITE;
		this.glyph.fg = this.color;
		this.tags.add("player");
		setObjectBaseValues(this, {
			level: 1,
			speed: 4,
			hpMax: 20,
			naturalAim: 85,
			naturalDamage: 4,
			naturalDodge: 10
		});
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
