/*
 * Created by aimozg on 13.03.2023.
 */

import {GameObject} from "./GameObject";
import {StatId} from "./ObjectStat";

export type OnStatChangeEventType = `onStatChange_${StatId}`;

export type StatChangeEventMap = {
	[T in OnStatChangeEventType]: GameStatEvent;
}
export interface CommonEventMap {
	onTick: GameTickEvent;
	// TODO consider removing in favor of specialized types
	onStatChange: GameStatEvent;
}
export type GameEventMap = CommonEventMap & StatChangeEventMap;
export type GameEventType = keyof GameEventMap;

export type GameEventHandlers = {
	[T in GameEventType]?: (this: GameObject, event:GameEventMap[T])=>void;
}


export interface GameEvent {
	object: GameObject;
}
export interface GameTickEvent extends GameEvent {
}
export interface GameStatEvent extends GameEvent {
	stat: StatId;
	oldValue: number;
	newValue: number;
}
