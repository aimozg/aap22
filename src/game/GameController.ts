/*
 * Created by aimozg on 05.03.2023.
 */

import {XY} from "../utils/grid/geom";
import {Creature} from "./core/Creature";
import {Player} from "./core/Player";
import {LogManager} from "../utils/logging/LogManager";
import {MonsterAI} from "./combat/MonsterAI";
import {GameObject} from "./ecs/GameObject";
import {Game} from "./Game";
import {DamageType, DamageTypes} from "./combat/DamageType";
import {Corpse} from "./objects/Corpse";
import {Tiles} from "./core/Tile";
import {MapObject} from "./core/MapObject";
import {ParticlePresetId} from "./ui/ParticlePresets";
import {genVisibilityMap} from "../utils/grid/los";
import {ChunkMapGen} from "./mapgen/ChunkMapGen";
import {dungeonChunks} from "./mapgen/dungeonChunks";
import {fillRooms} from "./mapgen/RoomFiller";
import {fillDijkstraMap} from "../utils/grid/dijkstra";
import {atLeast, coerce} from "../utils/math/utils";
import {DroppedItem, Item} from "./core/Item";

let logger = LogManager.loggerFor("GameController");

export let GameController = new class {

	setup() {}

	//---------//
	// HELPERS //
	//---------//

	playerCanAct = false;
	dirty        = true;

	//------//
	// CORE //
	//------//

	newGame() {
		this.generateNewLevel();

		this.log("{1;Game started!} Use arrow keys or numpad to move. ");

		GameController.initLevel();
		GameController.roundStart();
	}

	generateNewLevel() {
		while (true) {
			let level = ChunkMapGen.generateLevel(
				Game.state.maprng,
				40,
				40,
				dungeonChunks
			);
			if (level.rooms.length > 10) {
				fillRooms(level, Game.state.depth);
				Game.state.level = level;
				break;
			}
		}
	}

	initLevel() {
		let level         = Game.state.level;
		Game.state.roundNo = 1;
		Game.state.tickNo  = 0;
		Game.state.vismap  = new Int8Array(level.width*level.height);
		Game.state.approachPlayerMap = new Int8Array(level.width*level.height);
		for (let creature of level.creatures()) {
			creature.ap = creature.apPerAction;
		}
		this.dirty = true;
		this.updateMaps();
	}

	update() {
		this.playerCanAct = false;
		// TODO should do async with fx...
		let loop = true;
		while (loop) {
			loop = false;
			for (let creature of Game.state.level.creatures()) {
				if (creature.canAct()) {
					if (creature instanceof Player) {
						let queuedAction = this.playerActionQueue.shift();
						if (queuedAction) {
							queuedAction();
							this.dirty = true;
						} else {
							this.playerCanAct = true;
							this.updateMaps();
							return;
						}
					} else {
						this.dirty = true;
						this.doAI(creature);
						loop = true;
					}
					break;
				}
			}
		}
		this.nextTick();
	}

	updateMaps(state=Game.state) {
		if (this.dirty) {
			let level       = state.level;
			let player      = state.player;
			state.vismap = genVisibilityMap(level, player.pos, false, state.vismap);
			let approachMap = state.approachPlayerMap;
			approachMap.fill(127);
			approachMap[player.pos.y*level.width+player.pos.x] = 0;
			fillDijkstraMap(
				approachMap,
				level.width,
				level.height,
				(x,y)=>
					level.cellAt({x,y}).tile.walk,
				[player.pos],
				8
			);
			this.dirty       = false;
		}
	}
	log(message:string, substitutions?:Record<string, string|GameObject|number>) {
		if (substitutions) Game.screenManager.logsub(message, substitutions);
		else Game.screenManager.log(message);
	}

	//-----------------//
	// TIME MANAGEMENT //
	//-----------------//

	nextTick() {
		Game.state.tickNo++;
		if (Game.state.tickNo >= 4) {
			this.roundEnd();
		}
		this.tick();
	}

	tick() {
		logger.debug("tick {}.{}", Game.state.roundNo, Game.state.tickNo);
		for (let creature of Game.state.level.creatures()) {
			this.tickCreature(creature);
		}
	}

	roundStart() {
		logger.info("roundStart {}", Game.state.roundNo);
	}
	roundEnd() {
		Game.state.tickNo = 0;
		Game.state.roundNo++;
		this.roundStart();
	}
	tickCreature(creature:Creature) {
		creature.ap++;
	}

	doAI(creature:Creature) {
		logger.debug("doAI {}", creature);
		let ai = creature.findComponent(MonsterAI);
		if (!ai) {
			logger.warn("creature {} has no AI", creature);
			this.actSkip(creature);
		} else {
			ai.execute();
		}
	}

	//---------//
	// ACTIONS //
	//---------//

	actSmart(creature:Creature, dx:number, dy:number):boolean {
		logger.debug("actSmart {} {} {}", creature, dx, dy);
		if (dx === 0 && dy === 0) {
			this.actSkip(creature);
			return true;
		}

		let level = Game.state.level;
		let pos2 = XY.shift(creature.pos, dx, dy);
		if (!level.contains(pos2)) return false;

		let target = level.creatureAt(pos2);
		if (target) {
			if (creature.isHostileTo(target)) {
				this.actMeleeAttack(creature, target);
				return true;
			}
			return false;
		}

		if (level.tileAt(pos2) === Tiles.door_closed) {
			this.actOpenDoor(creature, pos2);
			return true;
		}

		if (!level.isEmpty(pos2)) return false;
		this.actStep(creature, pos2);
		return true
	}
	actStep(actor:Creature, newPos:XY) {
		logger.info("actStep {} {};{}", actor, newPos.x, newPos.y);
		actor.ap = 0;
		actor.setPos(newPos);
	}
	actSkip(actor:Creature) {
		logger.debug("actSkip {}", actor);
		actor.ap = 0;
	}
	actOpenDoor(actor:Creature, pos:XY) {
		logger.info("actOpenDoor {} {};{}",actor,pos.x,pos.y);
		actor.ap = 0;
		let level = actor.parentEntity!;
		let cell = level.cellAt(pos);
		if (cell.tile !== Tiles.door_closed) throw new Error(`No door at ${pos.x};${pos.y}!`);
		cell.tile = Tiles.door_open;
	}
	actMeleeAttack(actor:Creature, target:Creature) {
		logger.info("actMeleeAttack {} {}", actor, target);
		actor.ap = 0;
		// TODO
		let toHit = atLeast(0, actor.aim) - atLeast(0, target.dodge);
		let rng   = Game.state.rng;
		let wasHit = rng.d100vs(toHit);
		if (wasHit) {
			// this.log("{a} hit{a.s} {b}. ", {a:actor, b:target});
			let maxDamage = actor.damage;
			let minDamage = 1;
			let damageType = DamageTypes.PHYSICAL;

			if (minDamage > maxDamage) minDamage = maxDamage;
			let damage = rng.nextInt(minDamage, maxDamage);
			this.doDamage(target, damage, damageType, actor);
		} else {
			this.log("{a} miss{a.es} {b}. ", {a:actor, b:target});
		}
	}

	actPickup(actor: Creature, item:DroppedItem) {
		logger.debug("actPickup {} {}",actor, item);
		if (actor === Game.state.player) {
			// TODO actor.log?.()
			Game.screenManager.logsub("You pick up {item}. ", {item:item.item});
		}
		actor.ap = 0;
		if (actor.addItem(item.item)) {
			item.parentEntity?.removeObject(item);
		}
	}
	actDropInventoryItem(actor: Creature, item:Item) {
		logger.debug("actDropInventoryItem {} {}",actor, item);
		if (actor === Game.state.player) {
			// TODO actor.log?.()
			Game.screenManager.logsub("You drop {item}. ", {item:item});
		}
		actor.ap = 0;
		if (actor.removeItem(item)) {
			Game.gameController.doDropItem(item, actor.pos);
		}
	}
	actSwapOrEquipWeapon(actor: Creature, item:Item) {
		logger.debug("actSwapOrEquipWeapon {} {}",actor, item);
		if (actor.weapon) {
			let oldWeapon = actor.weapon;
			// TODO unequip
			actor.setWeapon(null);
			this.actEquipWeaponFromInventory(actor, item);
			actor.addItem(oldWeapon);
		} else {
			this.actEquipWeaponFromInventory(actor, item);
			return
		}
	}
	actEquipWeaponFromInventory(actor: Creature, item:Item) {
		logger.debug("actEquipWeaponFromInventory {} {}",actor, item);
		if (!item.weapon) throw new Error(`Cannot equip ${item} as weapon`);
		if (actor === Game.state.player) {
			// TODO actor.log?.()
			Game.screenManager.logsub("You equip {0}. ",[item]);
		}
		actor.ap = 0;
		actor.removeItem(item);
		actor.setWeapon(item);
	}
	actUseOnSelf(actor: Creature, item:Item) {
		logger.debug("actUseOnSelf {} {}",actor, item);
		if (!item.usable) throw new Error(`Cannot use ${item} on self`);
		if (!item.usable.canUse(actor)) return;
		actor.ap = 0;
		actor.removeItem(item);
		item.usable.use(actor);
	}

	//-----------//
	// MODIFIERS //
	//-----------//

	doDamage(target:Creature, damage:number, damageType:DamageType, source:MapObject|null) {
		logger.info("doDamage {} {} {} {}", target, damage, damageType.name, source);
		damage |= 0;
		// TODO adjust damage - resistances

		let str = source
			? "{b} damage{b.s} {a} ({{dmgcls};{dmg}}). "
			: "{a} take{a.s} ({{dmgcls};{dmg}}) damage. "
		this.log(str, {
			a: target,
			b: source!,
			dmg: damage,
			dmgcls: damage <= 0 ? "gray" : damageType.cls
		})
		if (damage <= 0) {
			return;
		}
		// Emit particles
		let direction:XY        = {x:0,y:-1};
		let pt: ParticlePresetId = "blood";
		if (source) {
			direction = XY.subtract(target.pos,source.pos);
		}
		if (target.tags.has("bones")) {
			pt = "bone";
		} else if (target.tags.has("construct")) {
			pt = "spark";
		}
		Game.screenManager.shootParticlesFrom(damage*damage, target.pos, direction, pt);
		target.hp -= damage;
		if (target.hp <= 0) {
			this.doKill(target, source);
		}
	}
	doHeal(target:Creature, amount:number):void {
		logger.info("doHeal {} {}", target, amount);
		amount = coerce(amount, 0, target.hpMax-target.hp);
		if (amount <= 0) return
		target.hp += amount;
		Game.screenManager.shootParticlesFrom(amount*5, target.pos, {x:0,y:0},"heal");
	}
	doKill(target:Creature, source:MapObject|null) {
		logger.info("doKill {} {}",target,source);
		/* TODO check for 'dead' condition
		if (!target.isAlive) {
			logger.warn(`doKill on dead {}`, target);
			return;
		}
		 */
		let level = target.parentEntity!;
		let cell = target.cell!;

		let str = /*source
			? "{b} {red;kill{b.s}} {a}. "
			: */"{a} {red;die{a.s}}. ";
		this.log(str, {a:target, b:source!});
		level.removeObject(target);
		cell.placeObject(new Corpse("dead "+target.name, target.color));
		// TODO award XP
		// TODO pool of blood
		// TODO gibbing
		for (let item of target.inventory) {
			if (!item) continue;
			this.doDropItem(item, cell.xy);
		}
	}
	doDropItem(item:Item, xy:XY):XY|null {
		let level = Game.state.level;
		let cell = level.findNearestCell(xy,8,
			(cell)=>!cell.objectOfType(DroppedItem),
			(cell)=>cell.tile.walk
			)
		if (cell) {
			let droppedItem = new DroppedItem(item);
			cell.placeObject(droppedItem);
			return cell.xy;
		}
		return null;
	}

	//-------//
	// INPUT //
	//-------//
	playerActionQueue:(()=>void)[] = [];
	queuePlayerAction(action:()=>void) {
		if (!this.playerCanAct) {
			this.playerActionQueue.push(action);
		} else {
			action();
			this.dirty = true;
		}
	}

	playerSmartAction(dx: number, dy: number) {
		logger.debug("playerSmartAction {} {}", dx, dy);
		this.queuePlayerAction(()=>this.actSmart(Game.state.player, dx, dy));
	}
	playerPickup() {
		this.queuePlayerAction(()=>{
			let player = Game.state.player;
			let cell = player.cell!;
			let item = cell.objects.find((o):o is DroppedItem=>o instanceof DroppedItem);
			if (!item) {
				Game.screenManager.log("Nothing to pickup! ");
			} else {
				this.actPickup(player, item);
			}
		})
	}
	playerSmartEquip(item:Item) {
		this.queuePlayerAction(()=>{
			let player = Game.state.player;
			let i = player.inventory.indexOf(item);
			if (i < 0) return;
			if (item.weapon) {
				this.actSwapOrEquipWeapon(player, item);
			}
		})
	}
}
