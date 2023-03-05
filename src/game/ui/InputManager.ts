/*
 * Created by aimozg on 05.03.2023.
 */
import {KeyCodes} from "../../utils/ui/KeyCodes";
import {GameController} from "../GameController";

let hkActions = {
	MoveUpLeft() { GameController.tryPlayerStep(-1,-1) },
	MoveUp() { GameController.tryPlayerStep(0,-1) },
	MoveUpRight() { GameController.tryPlayerStep(+1,-1) },
	MoveLeft() { GameController.tryPlayerStep(-1,0) },
	SkipTurn() { /* TODO skip turn */ },
	MoveRight() { GameController.tryPlayerStep(+1,0) },
	MoveDownLeft() { GameController.tryPlayerStep(-1,+1) },
	MoveDown() { GameController.tryPlayerStep(0,+1) },
	MoveDownRight() { GameController.tryPlayerStep(+1,+1) },
}

let hotkeys:Record<string,()=>void> = {
	[KeyCodes.ARROWUP]: hkActions.MoveUp,
	[KeyCodes.ARROWDOWN]: hkActions.MoveDown,
	[KeyCodes.ARROWLEFT]: hkActions.MoveLeft,
	[KeyCodes.ARROWRIGHT]: hkActions.MoveRight,
	[KeyCodes.NUMPAD7]: hkActions.MoveUpLeft,
	[KeyCodes.NUMPAD8]: hkActions.MoveUp,
	[KeyCodes.NUMPAD9]: hkActions.MoveUpRight,
	[KeyCodes.NUMPAD4]: hkActions.MoveLeft,
	[KeyCodes.NUMPAD5]: hkActions.SkipTurn,
	[KeyCodes.NUMPAD6]: hkActions.MoveRight,
	[KeyCodes.NUMPAD1]: hkActions.MoveDownLeft,
	[KeyCodes.NUMPAD2]: hkActions.MoveDown,
	[KeyCodes.NUMPAD3]: hkActions.MoveDownRight,
}

export class InputManager {
	setup() {
		// Setup event listeners
		document.addEventListener("keydown", this.onKeyDown.bind(this));
	}
	onKeyDown(e:KeyboardEvent) {
		let hk = KeyCodes.eventToHkString(e);
		if (hk in hotkeys) {
			e.preventDefault();
			hotkeys[hk]();
		}
	}
}
