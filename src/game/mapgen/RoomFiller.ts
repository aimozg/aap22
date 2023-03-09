/*
 * Created by aimozg on 09.03.2023.
 */

import {Level, Room} from "../core/Level";
import {GameState} from "../GameState";
import {LevelExit} from "../objects/LevelExit";
import {Creature} from "../core/Creature";
import {MonsterLib} from "../data/MonsterLib";
import {MonsterAI} from "../monster/MonsterAI";
import {LogManager} from "../../utils/logging/LogManager";

let logger = LogManager.loggerFor("RoomFiller");

function fillRoom(level:Level, room:Room, threatLevel:number) {
	let maprng = GameState.maprng;
	let n = maprng.nextInt(2, 5);
	while (n-->0) {
		let cell = room.randomEmptyCell(maprng);
		if (!cell) {
			logger.warn("No empty cells in room {}", room);
		} else {
			level.addObject(
				new Creature(
					maprng.either(MonsterLib.Zombie, MonsterLib.Skeleton),
					new MonsterAI()),
				cell!.xy
			);
		}
	}
}

export function fillRooms(level:Level, threatLevel:number) {
	let maprng = GameState.maprng;
	let rooms = level.rooms.slice();
	let pcroom = maprng.randpop(rooms);
	level.addObject(GameState.player, pcroom.randomEmptyCell(maprng)!.xy);

	let exitroom = maprng.pick(rooms);
	let exitcell = level.cellAt(exitroom.center());
	if (!exitcell.isEmpty) exitcell = exitroom.randomEmptyCell(maprng)!;
	level.addObject(new LevelExit(), exitcell.xy);

	for (let room of rooms) {
		fillRoom(level, room, room === exitroom ? threatLevel+1 : threatLevel);
	}
}
