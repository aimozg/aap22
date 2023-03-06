/*
 * Created by aimozg on 05.03.2023.
 */

import {GameState} from "./GameState";
import {XY} from "../utils/geom";
import {Creature} from "./core/Creature";
import {Player} from "./core/Player";
import {LogManager} from "../utils/logging/LogManager";
import {MonsterAI} from "./monster/MonsterAI";
import {Entity} from "./Entity";
import {Game} from "./Game";
import {DamageType, DamageTypes} from "./combat/DamageType";
import {Corpse} from "./objects/Corpse";

let logger = LogManager.loggerFor("game.GameController");

export let GameController = new class {

	setup() {}

	//---------//
	// HELPERS //
	//---------//

	playerCanAct = false;

	//------//
	// CORE //
	//------//

	initLevel() {
		for (let creature of GameState.level.creatures()) {
			creature.ap = creature.speed;
		}
	}

	update() {
		this.playerCanAct = false;
		for (let creature of GameState.level.creatures()) {
			if (creature.canAct()) {
				if (creature instanceof Player) {
					this.playerCanAct = true;
				} else {
					this.doAI(creature);
				}
				return;
			}
		}
		this.nextTick();
	}

	log(message:string, substitutions?:Record<string, string|Entity|number>) {
		if (substitutions) Game.screenManager.logsub(message, substitutions);
		else Game.screenManager.log(message);
	}

	//-----------------//
	// TIME MANAGEMENT //
	//-----------------//

	nextTick() {
		GameState.tickNo++;
		if (GameState.tickNo >= 4) {
			this.roundEnd();
		}
		this.tick();
	}

	tick() {
		logger.debug("tick {}.{}", GameState.roundNo, GameState.tickNo);
		for (let creature of GameState.level.creatures()) {
			this.tickCreature(creature);
		}
	}

	roundStart() {
		logger.info("roundStart {}", GameState.roundNo);
	}
	roundEnd() {
		GameState.tickNo = 0;
		GameState.roundNo++;
		this.roundStart();
	}
	tickCreature(creature:Creature) {
		creature.ap++;
	}

	doAI(creature:Creature) {
		logger.info("doAI {}", creature);
		let ai = creature.findEffect(MonsterAI);
		if (!ai) {
			logger.warn("creature {} has no AI", creature);
			this.doSkip(creature);
		} else {
			ai.execute();
		}
	}

	//---------//
	// ACTIONS //
	//---------//

	smartAction(creature:Creature, dx:number, dy:number):boolean {
		logger.debug("smartAction {} {} {}", creature, dx, dy);
		let level = GameState.level;
		let pos2 = XY.shift(creature.pos, dx, dy);
		if (!level.contains(pos2)) return false;

		let target = level.creatureAt(pos2);
		if (target) {
			if (creature.isHostileTo(target)) {
				this.doMeleeAttack(creature, target);
				return true;
			}
			return false;
		}

		if (!level.isEmpty(pos2)) return false;
		this.doStep(creature, pos2);
		return true
	}
	doStep(creature:Creature, newPos:XY) {
		logger.info("doStep {}", creature, newPos);
		creature.ap = 0;
		creature.setPos(newPos);
	}
	doSkip(creature:Creature) {
		logger.info("doSkip {}", creature);
		creature.ap = 0;
	}
	doMeleeAttack(actor:Creature, target:Creature) {
		logger.info("doMeleeAttack {} {}", actor, target);
		// TODO
		let toHit = actor.aim - target.dodge;
		let rng   = GameState.rng;
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
	doDamage(target:Creature, damage:number, damageType:DamageType, source:Entity|null) {
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
		target.hp -= damage;
		if (target.hp <= 0) {
			this.doKill(target, source);
		}
	}
	doKill(target:Creature, source:Entity|null) {
		logger.info("doKill {} {}",target,source);
		let pos          = target.pos;
		let level = target.parentEntity;
		let str = /*source
			? "{b} {red;kill{b.s}} {a}. "
			: */"{a} {red;die{a.s}}.";
		this.log(str, {a:target, b:source!});
		level.removeObject(target);
		level.addObject(new Corpse("dead "+target.name, target.color), pos);
		// TODO award XP
	}

	//-------//
	// INPUT //
	//-------//

	playerSmartAction(dx: number, dy: number):boolean {
		logger.debug("playerSmartAction {} {}", dx, dy);
		if (!this.playerCanAct) return false;
		return this.smartAction(GameState.player, dx, dy);
	}
}
