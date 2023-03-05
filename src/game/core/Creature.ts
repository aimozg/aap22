import {MapObject} from "./MapObject";
import {GlyphData} from "../ui/GlyphLayer";

export interface CreaturePrototype {
	name: string;
	ch: string;
	color: string;
}

export class Creature extends MapObject {
	constructor(
		proto: CreaturePrototype
	) {
		super();
		this.name  = proto.name;
		this.glyph = {
			ch: proto.ch,
			// TODO blink if has special condition
			fg: proto.color
		}
	}

	z = MapObject.Z_CREATURE;
	glyph: GlyphData;
	name: string;
	walkable = false;
}

