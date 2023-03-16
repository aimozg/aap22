/*
 * Created by aimozg on 09.03.2023.
 */

import {Level, Room} from "../core/Level";
import {LevelExit} from "../objects/LevelExit";
import {MonsterLib} from "../data/MonsterLib";
import {MonsterAI} from "../combat/MonsterAI";
import {LogManager} from "../../utils/logging/LogManager";
import {Item} from "../core/Item";
import {WeaponLib} from "../data/WeaponLib";
import {Monster} from "../core/Monster";
import {Game} from "../Game";

let logger = LogManager.loggerFor("RoomFiller");

function fillRoom(level:Level, room:Room, threatLevel:number) {
	let maprng = Game.state.maprng;
	let n = maprng.nextInt(2, 5);
	let proto = maprng.either(MonsterLib.Zombie, MonsterLib.Skeleton);
	while (n-->0) {
		let cell = room.randomEmptyCell(maprng);
		if (!cell) {
			logger.warn("No empty cells in room {}", room);
		} else {
			let creature = new Monster(
				proto,
				undefined,
				new MonsterAI());
			if (maprng.nextBoolean(0.25)) {
				let id = maprng.pickWeightedTuple([
					[1, WeaponLib.dagger],
					[0.5, WeaponLib.sword],
					[0.25, WeaponLib.greatsword],
				]);
				let item = new Item(id);
				creature.addItem(item);
			}
			level.addObject(creature, cell!.xy);
		}
	}
}

export function fillRooms(level:Level, threatLevel:number) {
	let maprng = Game.state.maprng;
	let rooms = level.rooms.slice();
	let pcroom = maprng.randpop(rooms);
	level.addObject(Game.state.player, pcroom.randomEmptyCell(maprng)!.xy);

	let exitroom = maprng.pick(rooms);
	let exitcell = level.cellAt(exitroom.center());
	if (!exitcell.isEmpty) exitcell = exitroom.randomEmptyCell(maprng)!;
	level.addObject(new LevelExit(), exitcell.xy);

	for (let room of rooms) {
		fillRoom(level, room, room === exitroom ? threatLevel+1 : threatLevel);
	}
}
