/*
 * Created by aimozg on 13.03.2023.
 */

import {GameObject} from "./GameObject";

export interface ObjectEventKeys {
	onAdd: ObjectAddEvent;
}

export type ObjectEventType = keyof ObjectEventKeys;

export interface ObjectEvent {
	target: GameObject;
}
export interface ObjectAddEvent extends ObjectEvent{
	child: GameObject;
}
