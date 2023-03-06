/*
 * Created by aimozg on 13.07.2022.
 */

import {Dice} from "./Dice";

export abstract class Random {
	abstract saveState(): object;
	abstract loadState(state: object): void;
	abstract nextI32(): number;
	/**
	 * Random float between 0 (inclusive) and 1 (exclusive)
	 */
	next01(): number {
		return this.nextBits(26) * (2 ** -26) + this.nextBits(27) * (2 ** -53)
	}

	/**
	 * Random float between min (inclusive) and max (exclusive)
	 */
	nextFloat(min: number, max: number): number;
	/**
	 * Random float between 0 (inclusive) and max (exclusive)
	 */
	nextFloat(max: number): number;
	/**
	 * Random float between 0 (inclusive) and 1 (exclusive)
	 */
	nextFloat(): number;
	nextFloat(...args: number[]): number {
		let x = this.next01();
		if (arguments.length === 0) return x;
		let min, max;
		if (arguments.length === 2) {
			min = arguments[0];
			max = arguments[1];
		} else if (arguments.length === 1) {
			min = 0;
			max = arguments[0];
		}
		let d = max - min;
		return x * d + min;
	}

	nextBits(bitCount: number): number {
		bitCount |= 0;
		if (bitCount === 0) return 0;
		if (bitCount < 0 || bitCount > 32) throw new Error("Invalid bitCount");
		let x = this.nextI32();
		if (bitCount === 32) return x;
		let mask = (1 << bitCount) - 1;
		return x & mask;
	}
	/**
	 * Generate random integer:
	 * - nextInt(): random 32-bit integer
	 * - nextInt(max): between 0 (inclusive) and max (exclusive)
	 * - nextInt(min,max) between min (inclusive) and max (exclusive)
	 */
	nextInt(min: number, max: number): number;
	/**
	 * Generate random integer:
	 * - nextInt(): random 32-bit integer
	 * - nextInt(max): between 0 (inclusive) and max (exclusive)
	 * - nextInt(min,max) between min (inclusive) and max (exclusive)
	 */
	nextInt(max: number): number;
	/**
	 * Generate random integer:
	 * - nextInt(): random 32-bit integer
	 * - nextInt(max): between 0 (inclusive) and max (exclusive)
	 * - nextInt(min,max) between min (inclusive) and max (exclusive)
	 */
	nextInt(): number;
	/**
	 * Generate random integer:
	 * - nextInt(): random 32-bit integer
	 * - nextInt(max): between 0 (inclusive) and max (exclusive)
	 * - nextInt(min,max) between min (inclusive) and max (exclusive)
	 */
	nextInt(...args: number[]): number {
		let min, max;
		if (arguments.length === 0) return this.nextI32();
		if (arguments.length === 1) {
			min = 0;
			max = arguments[0];
		}
		if (arguments.length === 2) {
			min = arguments[0];
			max = arguments[1];
		}
		let n = max - min;
		if (n === 0) return min;
		if (n < 0) throw new Error("Invalid nextInt bounds");
		if (n > 1 << 30) return Math.floor(this.nextFloat.apply(this, arguments));
		let rnd = this.nextInt() >>> 1;
		return rnd % n + min;
	}

	nextBoolean(trueChance: number = 0.5): boolean {
		if (trueChance <= 0.0) return false;
		if (trueChance >= 1.0) return true;
		return this.next01() < trueChance;
	}

	private savedGaussian: number;
	private hasNextGaussian = false;
	nextGaussian(variance: number = 1.0, mean: number = 0.0): number {
		let g: number;
		if (this.hasNextGaussian) {
			this.hasNextGaussian = false;
			g = this.savedGaussian;
		} else {
			let v1, v2, s;
			do {
				v1 = 2 * this.next01() - 1;
				v2 = 2 * this.next01() - 1;
				s = v1 * v1 + v2 * v2;
			} while (s >= 1 || s == 0);
			let multiplier = Math.sqrt(-2 * Math.log(s) / s);
			this.savedGaussian = v2 * multiplier;
			this.hasNextGaussian = true;
			g = v1 * multiplier;
		}
		return g * variance + mean;
	}

	dice(rolls: number, sides: number): number {
		rolls |= 0;
		sides |= 0;
		if (rolls === 0 || sides === 0) return 0;
		if (sides === 1) return rolls;
		if (rolls < 0) return -this.dice(-rolls, sides);
		if (sides < 0) throw new Error("Invalid dice " + rolls + "d" + sides);
		let accum = 0;
		while (rolls-->0) accum += 1 + this.nextInt(sides)
		return accum;
	}
	d2(rolls: number = 1): number { return this.dice(rolls, 2); }
	d3(rolls: number = 1): number { return this.dice(rolls, 3); }
	d4(rolls: number = 1): number { return this.dice(rolls, 4); }
	d5(rolls: number = 1): number { return this.dice(rolls, 5); }
	d6(rolls: number = 1): number { return this.dice(rolls, 6); }
	d8(rolls: number = 1): number { return this.dice(rolls, 8); }
	d10(rolls: number = 1): number { return this.dice(rolls, 10); }
	d12(rolls: number = 1): number { return this.dice(rolls, 12); }
	d20(rolls: number = 1): number { return this.dice(rolls, 20); }
	d100(rolls: number = 1): number { return this.dice(rolls, 100); }
	roll(dice: Dice): number {
		return this.dice(dice.rolls, dice.sides) + dice.bonus;
	}
	d100vs(chance: number): boolean {
		if (chance <= 0) return false;
		if (chance >= 100) return true;
		return this.d100() <= chance;
	}

	/**
	 * Generate a random permutation of numbers between from (inclusive) and to (inclusive)
	 */
	numberPermutation(to: number, from: number = 1): Int32Array {
		let n = from + 1 - to;
		let result = new Int32Array(n);
		for (let i = 0; i < n; i++) result[i] = i + to;
		this.shuffle(result);
		return result;
	}
	/**
	 * In-place random permutation of elements of source
	 */
	shuffle<E, T extends WritableArrayLike<E>>(source: T): T {
		let n = source.length;
		// Fisher-Yates shuffle
		for (let i = 0; i < n - 2; i++) {
			let j = i + this.nextInt(n - i);
			let old = source[i];
			source[i] = source[j];
			source[j] = old;
		}
		return source;
	}
	pick(source:ArrayLike<number>):number;
	pick<E>(source:E[]):E;
	pick<T extends ArrayLike<E>, E>(source:T):E {
		if (source.length === 0) throw new Error("Cannot pick from empty list");
		return source[this.nextInt(source.length)];
	}
	randpop<E>(source:E[]):E {
		if (source.length === 0) throw new Error("Cannot pick from empty list");
		let i = this.nextInt(source.length);
		let x = source[i];
		source.splice(i, 1);
		return x;
	}
	either<E>(...options:E[]):E {
		return this.pick(options);
	}
	pickOrUndefined<E>(source: E[]):E|undefined {
		if (source.length === 0) return undefined;
		return this.pick(source);
	}
	pickOrNull<E>(source: E[]):E|null {
		if (source.length === 0) return null;
		return this.pick(source);
	}
	pickWeighted<E>(source:E[], weightFn:(e:E)=>number):E {
		let e = this.pickWeightedOrNull(source, weightFn);
		if (e === null) throw new Error("Cannot pick from empty list");
		return e;
	}
	pickWeightedOrNull<E>(source:E[], weightFn:(e:E)=>number):E|null {
		if (source.length === 0) return null;
		// Single-pass weighted random
		// At each iteration i:
		// - if Zi <= w(i) / S(i), pick x_i
		// - if Zi >  w(i) / S(i), pick unchanged
		// where Zi is random(0..1), w(i) is weight of x_i,
		// S(i) = w(1) + w(2) + ... + w(i) = partial sum
		let pick:E|null = null;
		let sum = 0;
		for (let e of source) {
			let w = weightFn(e);
			if (w >= Infinity) return e;
			if (w <= 0) continue;
			if (isNaN(w)) throw new Error("Invalid weighted random element");
			sum += w;
			let z = this.nextFloat();
			if (z <= w/sum) pick = e;
		}
		return pick;
	}
}
export interface WritableArrayLike<T> {
	readonly length: number;
	[n: number]: T;
}

