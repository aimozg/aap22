/*
 * Created by aimozg on 04.03.2023.
 */

import {GameState} from "./GameState";
import {ScreenManager} from "./ui/ScreenManager";
import {InputManager} from "./ui/InputManager";
import {GameController} from "./GameController";
import {XorWowRandom} from "../utils/math/XorWowRandom";
import {Random} from "../utils/math/Random";


export namespace Game {

	export const state = GameState;
	export let rng = state.rng;
	export let maprng = state.maprng;
	export let fxrng:Random = XorWowRandom.create();
	export let screenManager: ScreenManager;
	export let inputManager: InputManager;
	export const gameController = GameController;

	export async function start() {
		// TODO main menu
		screenManager = new ScreenManager();
		inputManager = new InputManager();
		await GameController.setup();
		await screenManager.setup();
		await inputManager.setup();

		screenManager.beforeRender = ()=>{
			GameController.update();
			GameController.checkVisibility();
		}

		GameState.resetGame();
		GameController.newGame();

		screenManager.resizeCanvas();
	}


}
