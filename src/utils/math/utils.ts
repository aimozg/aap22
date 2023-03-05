/*
 * Created by aimozg on 21.07.2022.
 */
export function coerce(value:number, min:number, max:number):number {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}
export const atLeast = Math.max;
export const atMost = Math.min;
/** Linear interpolation */
export function lint(t:number, value0:number, value1:number):number {
	return value0 + (value1-value0)*t;
}

export function logarithm(base:number, argument:number): number {
	return Math.log(argument)/Math.log(base);
}
