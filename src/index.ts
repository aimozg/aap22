/*
 * Created by aimozg on 04.03.2023.
 */
import "./styles.scss";
import {LogManager} from "./utils/logging/LogManager";
import {LogLevel} from "./utils/logging/Logger";
import {Game} from "./game/Game";

LogManager.setLevels({
	"": LogLevel.DEBUG
});

(window as any).Game = Game;
Game.start(document.querySelector("main")!).then();
