/*
 * Created by aimozg on 16.03.2023.
 */
import {UUID} from "./utils";
import {GameObject} from "./GameObject";
import {EntityLoader} from "./EntityLoader";
import {XorWowRandom} from "../../utils/math/XorWowRandom";
import {EntityData} from "./decorators";

export abstract class AbstractRootGameState extends GameObject {
	static randomSeed():number {
		return (Math.random()*1_000_000_000)|0
	}

	protected constructor(clsid: string,
						  seed: number = AbstractRootGameState.randomSeed(),
	                      uuid: number = UUID()) {
		super(clsid, null, uuid);
		this.seed = seed;
		this.rng = XorWowRandom.create(this.seed,0);
	}
	@EntityData()
	seed:number;
	// TODO EntityData with custom loader
	rng:XorWowRandom;

	resetGame() {}

	saveCustomData(data: Record<string, any>) {
		data.uuidCounter = UUID.counter;
		data.rng = this.rng.saveState();
	}

	loadCustomData(data: Record<string, any>, ctx: EntityLoader) {
		let uuid = data.uuidCounter;
		ctx.requireType(uuid, "number", "uuid");
		UUID.counter = uuid as number;
		this.rng.loadState(data.rng);
	}
}
