/*
 * Created by aimozg on 07.03.2023.
 */
import {MapObject} from "../core/MapObject";
import {GlyphData} from "../../utils/ui/GlyphLayer";
import {Colors} from "../../utils/ui/canvas";
import {UUID} from "../ecs/utils";
import {ChildGameObject} from "../ecs/GameObject";
import {EntityClassLoader} from "../ecs/EntityClassLoader";
import {EntityJson} from "../ecs/EntityLoader";

export class LevelExit extends MapObject {
	static readonly CLSID = "LevelExit";
	constructor(uuid: number = UUID()) {
		super(LevelExit.CLSID, null, uuid);
	}

	glyph: GlyphData = {
		ch: '>',
		fg: Colors.YELLOW
	};
	name = "exit";
	walkable = true;
	z = MapObject.Z_PLACEABLE;

	saveChildren(): ChildGameObject[] {
		return [];
	}
	static Loader:EntityClassLoader<LevelExit> = {
		clsid: LevelExit.CLSID,
		create(e: EntityJson): LevelExit {
			return new LevelExit(e.uuid);
		}
	}
}
