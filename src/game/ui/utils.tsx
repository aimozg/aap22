import {DroppedItem, Item, ItemRarity} from "../core/Item";
import jsx from "texsaur";
import {createElement} from "../../utils/ui/dom";
import {GameObject} from "../ecs/GameObject";
import {Creature} from "../core/Creature";
import {Corpse} from "../objects/Corpse";
import {objectClassName} from "../../utils/types";

export function itemNameSpan(item: Item | null | undefined): Node | string {
	if (!item) return "-";
	let itemdesc = "";
	if (item.weapon) itemdesc += ` (${item.weapon.damage})`;
	if (item.armor) itemdesc += ` [${item.armor.defense}]`;
	return <span class={'text-rarity-' + ItemRarity[item.rarity].toLowerCase()}>{item.name}{itemdesc}</span>
}

export function richText(source: string): HTMLElement[] {
	let result: HTMLElement[] = [];
	let i                     = 0;
	let chunk                 = "";
	let cls                   = "";

	function flush() {
		if (chunk.length > 0) {
			let props: Record<string, any> = {};
			if (cls) {
				if (cls[0] === '#') {
					props.style = "color: " + cls;
				} else {
					props.class = "text-" + cls;
				}
			}
			result.push(createElement("span", props, chunk));
		}
		chunk = "";
		cls   = "";
	}

	while (i < source.length) {
		let c = source[i++];
		if (c === '\\' && i < source.length) {
			chunk += source[i++];
		} else if (c === '{') {
			flush();
			let j = source.indexOf(';', i);
			if (j > i && j < source.indexOf('}', i)) {
				cls = source.substring(i, j);
				i   = j + 1;
			}
		} else if (c === '}') {
			flush();
		} else {
			chunk += c;
		}
	}
	flush();
	return result;
}

export function formatTag(obj:GameObject, key:string=""):string {
	if (obj instanceof Creature) {
		switch (key) {
			case "":
				return `{1;${obj.name}}`
			case "s":
				// if plural return ""
				return "s";
			case "es":
				// if plural return ""
				return "es";
		}
	} else if (obj instanceof DroppedItem) {
		return formatTag(obj.item, key);
	} else if (obj instanceof Item) {
		switch (key) {
			case "":
				return `{rarity-${ItemRarity[obj.rarity].toLowerCase()};${obj.name}}`;
		}
	} else if (obj instanceof Corpse) {
		switch (key) {
			case "":
				return obj.name;
		}
	}
	return `{error;Unknown tag ${objectClassName(obj)}.${key}}`
}
