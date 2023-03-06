/*
 * Created by aimozg on 13.07.2022.
 */
import {Random} from "./Random";

/**
 * A modification of JetBrains XorWowRandom which exposes the state for serialization
 *
 * ----
 *
 * Random number generator, using Marsaglia's "xorwow" algorithm
 *
 * Cycles after 2^192 - 2^32 repetitions.
 *
 * For more details, see Marsaglia, George (July 2003). "Xorshift RNGs". Journal of Statistical Software. 8 (14). doi:10.18637/jss.v008.i14
 *
 * Available at https://www.jstatsoft.org/v08/i14/paper
 *
 */
export class XorWowRandom extends Random {
	static create(
		seed1:number=(Math.random()*(1<<31))|0,
		seed2:number=(Math.random()*(1<<31))|0
	):XorWowRandom {
		return new XorWowRandom(
			seed1,
			seed2,
			0,
			0,
			~seed1,
			(seed1<<10)^(seed2>>>4),
			true
		)
	}

	constructor(
		private x:number,
		private y:number,
		private z:number,
		private w:number,
		private v:number,
		private addend:number,
		warmup:boolean = true
	) {
		super();
		this.x |= 0;
		this.y |= 0;
		this.z |= 0;
		this.w |= 0;
		this.v |= 0;
		this.addend |= 0;
		this.validate();
		if (warmup) for (let n = 64; n-->0;) this.nextI32()
	}
	private validate() {
		if (this.x === 0 && this.y === 0 && this.z === 0 && this.w === 0 && this.v === 0)
			throw new Error("Initial state must have at least one non-zero element")
	}
	saveState(): object {
		return ['XorWowRandom',this.x,this.y,this.z,this.w,this.v,this.addend];
	}
	loadState(state: object): void {
		if (!Array.isArray(state) || state.length !==7 || state[0] !== 'XorWowRandom') throw new Error("Invalid random state for XorWowRandom");
		this.x = state[1]|0;
		this.y = state[2]|0;
		this.z = state[3]|0;
		this.w = state[4]|0;
		this.v = state[5]|0;
		this.addend = state[6]|0;
		this.validate();
	}
	nextI32(): number {
		let t = this.x;
		t = t ^ (t >>> 2);
		// noinspection JSSuspiciousNameCombination
		this.x = this.y;
		this.y = this.z;
		this.z = this.w;
		let v0 = this.v;
		this.w = v0;
		t = (t ^ (t << 1)) ^ v0 ^ (v0 << 4);
		this.v = t;
		this.addend += 362437;
		return (t + this.addend)|0;
	}
}
