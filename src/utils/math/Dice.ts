/*
 * Created by aimozg on 24.07.2022.
 */
import {Random} from "./Random";

export class Dice {
	constructor(
		public readonly rolls: number,
		public readonly sides: number,
		public readonly bonus: number = 1,
		public readonly rangeFormat: boolean = false
	) {
		if (!isFinite(rolls)
			|| !isFinite(sides)
			|| !isFinite(rolls)
			|| (sides|0) < 0
			|| rangeFormat && rolls > 1
		) throw new Error(`Invalid dice ${rolls} d ${sides} + ${bonus} / ${rangeFormat}`)
		this.rolls |= 0;
		this.sides |= 0;
		this.bonus |= 0;
		// 0dX && Xd0 -> 0
		if (this.rolls === 0) this.sides = 0;
		else if (this.sides === 0) this.rolls = 0;
	}

	toString() {
		const {rolls, sides, bonus} = this;
		if (rolls === 0 || sides === 0) return String(bonus);
		if (this.rangeFormat) return String(this.min)+".."+String(this.max);
		let s = "" + rolls + "d" + sides;
		if (bonus > 0) s += "+" + bonus;
		else if (bonus < 0) s += bonus;
		return s;
	}

	get min():number { return this.bonus + this.rolls }
	get max():number { return this.bonus + this.rolls * this.sides }

	roll(rng: Random): number {
		return rng.dice(this.rolls, this.sides) + this.bonus;
	}

	inverse(): Dice {
		return new Dice(-this.rolls, this.sides, -this.bonus)
	}

	withBonus(bonus: number): Dice {
		if (bonus === 0) return this;
		return new Dice(this.rolls, this.sides, this.bonus + bonus)
	}

	repeat(n: number): Dice {
		if (n === 0) return Dices.ZERO
		if (n === 1) return this
		return new Dice(this.rolls * n, this.sides, this.bonus * n)
	}

	static ranged(min:number, max:number):Dice {
		if (min > max) throw new Error(`Invalid dice ${min}..${max}`);
		if (min < 0 && max < 0) return Dice.ranged(-max, -min).inverse();
		return new Dice(1, max - min + 1, min - 1);
	}
	/**
	 * Spec formats:
	 * * X (can be signed)
	 * * XdY
	 * * XdY+Z, XdY-Z
	 * * X..Y (inclusive, can be signed)
	 */
	static parse(spec: string): Dice {
		let rolls, sides, bonus;
		let d = spec.indexOf('d');
		if (d < 0) {
			d = spec.indexOf('..');
			if (d < 0) {
				// X
				bonus = parseInt(spec);
				return new Dice(0, 0, bonus);
			}
			// X..Y
			let min = parseInt(spec.substring(0, d));
			let max = parseInt(spec.substring(d + 1));
			return Dice.ranged(min, max);
		}
		// XdY
		rolls = parseInt(spec.substring(0, d));
		let p = spec.indexOf('+');
		if (p < 0) p = spec.indexOf("-");
		if (p < 0) {
			sides = parseInt(spec.substring(d + 1));
			bonus = 0;
		} else {
			sides = parseInt(spec.substring(d + 1, p));
			bonus = parseInt(spec.substring(p));
		}
		return new Dice(rolls, sides, bonus);
	}
}

let lib = new Map<string, Dice>();

/**
 * Spec formats:
 * * X (can be signed)
 * * XdY
 * * XdY+Z, XdY-Z
 * * X..Y (can be signed)
 */
export function dice(spec: string): Dice {
	if (lib.has(spec)) return lib.get(spec)!;
	let dice = Dice.parse(spec);
	if (dice.bonus === 0) lib.set(spec, dice);
	return dice;
}

export const Dices = {
	ZERO: dice("0"),
	x1d2: dice("1d2"),
	x1d3: dice("1d3"),
	x1d4: dice("1d4"),
	x1d6: dice("1d6"),
	x2d6: dice("2d6"),
	x3d6: dice("3d6"),
	x4d6: dice("4d6"),
	x5d6: dice("5d6"),
	x6d6: dice("6d6"),
	x1d8: dice("1d8"),
	x1d10: dice("1d10"),
	x1d12: dice("1d12"),
	x1d20: dice("1d20"),
	x1d100: dice("1d100"),
};
