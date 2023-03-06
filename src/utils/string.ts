/*
 * Created by aimozg on 05.03.2023.
 */

export function repeatString(s:string, n:number):string {
	let result = "";
	while (n > 0) {
		if (n%2 === 0) result += s;
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
