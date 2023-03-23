/*
 * Created by aimozg on 04.03.2023.
 */


import {Level} from "./core/Level";
import {Player} from "./core/Player";
import {Random} from "../utils/math/Random";
import {XorWowRandom} from "../utils/math/XorWowRandom";
import {LogManager} from "../utils/logging/LogManager";
import {Tiles} from "./core/Tile";
import {WeaponLib} from "./data/WeaponLib";
import {Item} from "./core/Item";
import {AbstractRootGameState} from "./ecs/AbstractRootGameState";
import {EntityData, EntityReference} from "./ecs/decorators";
import {ChildGameObject, GameObject} from "./ecs/GameObject";
import {UUID} from "./ecs/utils";
import {EntityClassLoader} from "./ecs/EntityClassLoader";
import {EntityJson, EntityLoader} from "./ecs/EntityLoader";
import {Game} from "./Game";
import {UsableLib} from "./data/UsableLib";
import {XY} from "../utils/grid/geom";

let logger = LogManager.loggerFor("GameState");

export class GameState extends AbstractRootGameState {
	static CLSID = "GameState"

	constructor(seed: number = AbstractRootGameState.randomSeed(),
	            uuid: number = UUID()) {
		super(GameState.CLSID, seed, uuid);
		this.maprng = XorWowRandom.create(this.rng.nextInt(), this.rng.nextInt());
	}

	// TODO EntityData with custom loader
	maprng: Random;
	@EntityData()
	depth: number;
	// TODO @ChildObject
	level: Level;
	vismap: Int8Array;
	approachPlayerMap: Int8Array;
	@EntityReference()
	player: Player;

	@EntityData()
	roundNo: number;
	// 1 round = 4 ticks
	@EntityData()
	tickNo: number;

	isVisible(xy:XY):boolean {
		return this.level.contains(xy) && !!this.vismap[this.level.xy2i(xy.x,xy.y)];
	}

	saveChildren(): ChildGameObject[] {
		return [
			["level", this.level],
		];
	}

	loadChild(pos: any, child: GameObject) {
		if (pos === "level" && child instanceof Level) {
			this.level = child;
			return;
		}
		super.loadChild(pos, child);
	}

	afterLoad() {
		this.approachPlayerMap    = new Int8Array(this.level.width * this.level.height);
		Game.gameController.dirty = true;
		Game.gameController.updateMaps(this);
		Game.screenManager.particleLayer.clear();
		// TODO save decal layer
		Game.screenManager.decalLayer.clear();
	}

	get mapWidth() { return this.level.width }

	get mapHeight() { return this.level.height }


	saveCustomData(data: Record<string, any>) {
		super.saveCustomData(data);
		data.maprng = this.maprng.saveState();
	}

	loadCustomData(data: Record<string, any>, ctx: EntityLoader) {
		super.loadCustomData(data, ctx);
		this.maprng.loadState(data.maprng);
	}

	resetGame() {
		super.resetGame();

		this.depth               = 1;
		this.level               = new Level(1, 1);
		this.level.cells[0].tile = Tiles.floor;
		this.player              = new Player();
		this.player.setWeapon(new Item(WeaponLib.dagger));
		this.player.addItem(new Item(UsableLib.smallHealingPotion));
		this.level.addObject(this.player, {x: 0, y: 0});
	}

	static Loader = new class implements EntityClassLoader<GameState> {
		clsid = GameState.CLSID;

		create(e: EntityJson): GameState {
			return new GameState(e.uuid);
		}
	}
}
