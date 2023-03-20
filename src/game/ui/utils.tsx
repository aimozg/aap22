import {Item, ItemRarity} from "../core/Item";
import jsx from "texsaur";
import {createElement} from "../../utils/ui/dom";

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
