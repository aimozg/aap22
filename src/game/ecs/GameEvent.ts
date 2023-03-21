/*
 * Created by aimozg on 13.03.2023.
 */

import {GameObject} from "./GameObject";
import {StatId} from "./ObjectStat";
import {XY} from "../../utils/grid/geom";
import {DamageType} from "../combat/DamageType";

export type OnStatChangeEventType = `onStatChange_${StatId}`;

export type StatChangeEventMap = {
	[T in OnStatChangeEventType]: GameStatEvent;
}
export interface CommonEventMap {
	onTick: GameTickEvent;
	// TODO consider removing in favor of specialized types
	onStatChange: GameStatEvent;
	onStep: GameStepEvent;
	onBeforeAttack: GameBeforeAttackEvent;
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
export interface GameStepEvent extends GameEvent {
	actor: GameObject;
	oldPos: XY;
}
export interface GameBeforeAttackEvent extends GameEvent {
	attacker: GameObject;
	target: GameObject;
}
export interface GameAfterAttackEvent extends GameEvent {
	attacker: GameObject;
	target: GameObject;
	damage: number;
	damageType: DamageType;
}
