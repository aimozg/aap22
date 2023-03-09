/*
 * Created by aimozg on 05.03.2023.
 */

export function repeatString(s:string, n:number):string {
	let result = "";
	while (n > 0) {
		if (n%2 === 1) result += s;
		s += s;
		n >>= 1;
	}
	return result;
}
/**
 * Replaces in {@param pattern} `"{part}"` with parts from {@param substitutions}
 */
export function substitutePattern(
	pattern: string,
	substitutions: ((s: string) => string|undefined)
		| Record<string, string | (() => string) | number | undefined>
): string {
	if (!pattern.includes('{')) return pattern;
	let replacer: (part: string) => string | undefined;
	if (typeof substitutions === 'function') {
		replacer = substitutions;
	} else {
		// TODO add format? {part;spec}
		replacer = part => {
			let v = substitutions[part];
			return (typeof v === 'function') ? v() : String(v);
		}
	}
	return pattern.replace(/(?<!\\)\{([\w_.]+)}/g, (match, s) => replacer(s) ?? match)
}

const knownEntities = new Map<string, string>();
const tmpEl = document.createElement("span")
const entityRex = /^&(?:\w+|#x[a-fA-F\d]+|#\d+);$/

export function parseXmlEntity(entity: string): string {
	if (knownEntities.has(entity)) return knownEntities.get(entity)!;
	if (!entityRex.test(entity)) return entity;
	tmpEl.innerHTML = entity;
	let value = tmpEl.textContent!;
	knownEntities.set(entity, value);
	return value;
}

export const NBSP = '\u00A0';
export const ZWSP = '\u200B';
