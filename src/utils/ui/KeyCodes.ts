/*
 * Created by aimozg on 28.08.2022.
 */

export interface Hotkey {
	key: string;
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
}

export namespace KeyCodes {
	// QWERTY fn row
	export const ESCAPE = "Escape"
	export const F1 = "F1"
	export const F2 = "F2"
	export const F3 = "F3"
	export const F4 = "F4"
	export const F5 = "F5"
	export const F6 = "F6"
	export const F7 = "F7"
	export const F8 = "F8"
	export const F9 = "F9"
	export const F10 = "F10"
	export const F11 = "F11"
	export const F12 = "F12"
	// QWERTY digit row
	export const BACKQUOTE = "Backquote"
	export const DIGIT0 = "Digit0"
	export const DIGIT1 = "Digit1"
	export const DIGIT2 = "Digit2"
	export const DIGIT3 = "Digit3"
	export const DIGIT4 = "Digit4"
	export const DIGIT5 = "Digit5"
	export const DIGIT6 = "Digit6"
	export const DIGIT7 = "Digit7"
	export const DIGIT8 = "Digit8"
	export const DIGIT9 = "Digit9"
	export const MINUS = "Minus"
	export const EQUAL = "Equal"
	export const BACKSPACE = "Backspace"
	// QWERTY alphabet row 1
	export const TAB  = "Tab"
	export const KEYQ = "KeyQ"
	export const KEYW = "KeyW"
	export const KEYE = "KeyE"
	export const KEYR = "KeyR"
	export const KEYT = "KeyT"
	export const KEYY = "KeyY"
	export const KEYU = "KeyU"
	export const KEYI = "KeyI"
	export const KEYO = "KeyO"
	export const KEYP = "KeyP"
	export const BRACKETLEFT  = "BracketLeft"
	export const BRACKETRIGHT = "BracketRight"
	export const BACKSLASH = "Backslash"
	// QWERTY alphabet row 2
	export const CAPSLOCK = "CapsLock"
	export const KEYA = "KeyA"
	export const KEYS = "KeyS"
	export const KEYD = "KeyD"
	export const KEYF = "KeyF"
	export const KEYG = "KeyG"
	export const KEYH = "KeyH"
	export const KEYJ = "KeyJ"
	export const KEYK = "KeyK"
	export const KEYL = "KeyL"
	export const SEMICOLON = "Semicolon"
	export const QUOTE = "Quote"
	export const ENTER = "Enter"
	// QWERTY alphabet row 3
	export const SHIFTLEFT = "ShiftLeft"
	export const KEYZ = "KeyZ"
	export const KEYX = "KeyX"
	export const KEYC = "KeyC"
	export const KEYV = "KeyV"
	export const KEYB = "KeyB"
	export const KEYN = "KeyN"
	export const KEYM = "KeyM"
	export const COMMA = "Comma"
	export const PERIOD = "Period"
	export const SLASH = "Slash"
	export const SHIFTRIGHT = "ShiftRight"
	// QWERTY bottom row
	export const CONTROLLEFT = "ControlLeft"
	export const ALTLEFT = "AltLeft"
	export const SPACE = "Space"
	export const ALTRIGHT = "AltRight"
	export const CONTEXTMENU = "ContextMenu"
	export const CONTROLRIGHT = "ControlRight"
	// QWERTY arrows area
	export const PRINTSCREEN = "PrintScreen"
	export const SCROLLLOCK = "ScrollLock"
	export const PAUSE = "Pause"
	export const INSERT = "Insert"
	export const DELETE = "Delete"
	export const HOME = "Home"
	export const END = "End"
	export const PAGEUP = "PageUp"
	export const PAGEDOWN = "PageDown"
	export const ARROWUP = "ArrowUp"
	export const ARROWLEFT = "ArrowLeft"
	export const ARROWDOWN = "ArrowDown"
	export const ARROWRIGHT = "ArrowRight"
	// QWERTY numpad
	export const NUMLOCK = "NumLock"
	export const NUMPADDIVIDE = "NumpadDivide"
	export const NUMPADMULTIPLY = "NumpadMultiply"
	export const NUMPADSUBTRACT = "NumpadSubtract"
	export const NUMPADADD = "NumpadAdd"
	export const NUMPAD0 = "Numpad0"
	export const NUMPAD1 = "Numpad1"
	export const NUMPAD2 = "Numpad2"
	export const NUMPAD3 = "Numpad3"
	export const NUMPAD4 = "Numpad4"
	export const NUMPAD5 = "Numpad5"
	export const NUMPAD6 = "Numpad6"
	export const NUMPAD7 = "Numpad7"
	export const NUMPAD8 = "Numpad8"
	export const NUMPAD9 = "Numpad9"
	export const NUMPADDECIMAL = "NumpadDecimal"
	export const NUMPADENTER = "NumpadEnter"

	export const HOTKEY_PREFIX_CTRL = "Ctrl+"
	export const HOTKEY_PREFIX_SHIFT = "Shift+"
	export const HOTKEY_PREFIX_ALT = "Alt+"

	export let DefaultHotkeys = [
		DIGIT1,
		DIGIT2,
		DIGIT3,
		DIGIT4,
		DIGIT5,
		DIGIT6,
		DIGIT7,
		DIGIT8,
		DIGIT9,
		DIGIT0,
		HOTKEY_PREFIX_SHIFT+DIGIT1,
		HOTKEY_PREFIX_SHIFT+DIGIT2,
		HOTKEY_PREFIX_SHIFT+DIGIT3,
		HOTKEY_PREFIX_SHIFT+DIGIT4,
		HOTKEY_PREFIX_SHIFT+DIGIT5,
		HOTKEY_PREFIX_SHIFT+DIGIT6,
		HOTKEY_PREFIX_SHIFT+DIGIT7,
		HOTKEY_PREFIX_SHIFT+DIGIT8,
		HOTKEY_PREFIX_SHIFT+DIGIT9,
		HOTKEY_PREFIX_SHIFT+DIGIT0,
	];

	export function eventToHk(event:KeyboardEvent):Hotkey {
		let key = event.code;
		return {
			key: key,
			ctrl: event.ctrlKey && key !== CONTROLLEFT && key !== CONTROLRIGHT,
			alt: event.altKey && key !== ALTLEFT && key !== ALTRIGHT,
			shift: event.shiftKey && key !== SHIFTLEFT && key !== SHIFTRIGHT,
		}
	}
	export function hkToString(hk:Hotkey):string {
		let key = hk.key;
		if (hk.ctrl) key = HOTKEY_PREFIX_CTRL + key;
		if (hk.alt) key = HOTKEY_PREFIX_ALT + key;
		if (hk.shift) key = HOTKEY_PREFIX_SHIFT + key;
		return key;
	}
	export function eventToHkString(event:KeyboardEvent):string {
		return hkToString(eventToHk(event))
	}
	export function eventToHkShort(event:KeyboardEvent):string {
		return hkToShort(eventToHk(event));
	}
	export function hkLongToShort(hotkey:string):string {
		return hkToShort(stringToHk(hotkey));
	}
	export function stringToHk(key:string):Hotkey {
		let ctrl = key.startsWith(HOTKEY_PREFIX_CTRL)
		if (ctrl) key = key.slice(HOTKEY_PREFIX_CTRL.length)
		let alt = key.startsWith(HOTKEY_PREFIX_ALT)
		if (alt) key = key.slice(HOTKEY_PREFIX_ALT.length)
		let shift = key.startsWith(HOTKEY_PREFIX_SHIFT)
		if (shift) key = key.slice(HOTKEY_PREFIX_SHIFT.length)
		return {key,ctrl,alt,shift}
	}

	// TODO pick these from Keyboard API
	//    await navigator.keyboard
	const charKeys:Record<string,string> = {
		[BACKQUOTE]: '`',
		[DIGIT1]: '1',
		[DIGIT2]: '2',
		[DIGIT3]: '3',
		[DIGIT4]: '4',
		[DIGIT5]: '5',
		[DIGIT6]: '6',
		[DIGIT7]: '7',
		[DIGIT8]: '8',
		[DIGIT9]: '9',
		[DIGIT0]: '0',
		[MINUS]: '-',
		[EQUAL]: '=',
		[BRACKETLEFT]: '[',
		[BRACKETRIGHT]: ']',
		[BACKSLASH]: '\\',
		[SEMICOLON]: ';',
		[QUOTE]: "'",
		[COMMA]: ',',
		[PERIOD]: '.',
		[SLASH]: '/',
	}
	const charKeysShift:Record<string,string> = {
		[BACKQUOTE]: '~',
		[DIGIT1]: '!',
		[DIGIT2]: '@',
		[DIGIT3]: '#',
		[DIGIT4]: '$',
		[DIGIT5]: '%',
		[DIGIT6]: '^',
		[DIGIT7]: '&',
		[DIGIT8]: '*',
		[DIGIT9]: '(',
		[DIGIT0]: ')',
		[MINUS]: '_',
		[EQUAL]: '+',
		[BRACKETLEFT]: '{',
		[BRACKETRIGHT]: '}',
		[BACKSLASH]: '|',
		[SEMICOLON]: ':',
		[QUOTE]: '"',
		[COMMA]: '<',
		[PERIOD]: '>',
		[SLASH]: '?',
	}
	const nonCharKeys:Record<string,string> = {
		[ESCAPE]: 'Esc',
		[TAB]: "⇄",
		[BACKSPACE]: "BkSp",
		[ENTER]: "↵",
		[SPACE]: "⎵",
		[INSERT]: "Ins",
		[DELETE]: "Del",
		[PAGEUP]: "PgUp",
		[PAGEDOWN]: "PgDn",
		[ARROWUP]: "↑",
		[ARROWLEFT]: "←",
		[ARROWDOWN]: "↓",
		[ARROWRIGHT]: "→",
		[NUMPAD0]: "N0",
		[NUMPAD1]: "N1",
		[NUMPAD2]: "N2",
		[NUMPAD3]: "N3",
		[NUMPAD4]: "N4",
		[NUMPAD5]: "N5",
		[NUMPAD6]: "N6",
		[NUMPAD7]: "N7",
		[NUMPAD8]: "N8",
		[NUMPAD9]: "N9",
		[NUMPADDIVIDE]: "N/",
		[NUMPADMULTIPLY]: "N*",
		[NUMPADSUBTRACT]: "N-",
		[NUMPADADD]: "N+",
		[NUMPADDECIMAL]: "N.",
		[NUMPADENTER]: "N↵",
	}
	export function hkToShort(hk:Hotkey):string {
		let {key,ctrl,alt,shift} = hk;
		let pfx = ""
		if (ctrl && alt) pfx += "CA+"
		else if (ctrl) pfx += "C+"
		else if (alt) pfx += "A+"
		if (key.startsWith("Key") && key.length === 4) {
			let ch = key[3]
			ch = shift ? ch.toUpperCase() : ch.toLowerCase();
			return pfx + ch
		}
		if (shift && key in charKeysShift) return pfx + charKeysShift[key];
		if (!shift && key in charKeys) return pfx + charKeys[key];
		if (shift) pfx = "⇑"+pfx;
		if (key in nonCharKeys) return pfx + nonCharKeys[key];
		return pfx+key;
	}
}
