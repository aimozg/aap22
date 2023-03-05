/*
 * Created by aimozg on 04.07.2022.
 */

import {Logger, LogLevel} from "./Logger";
import {ConsoleLogger} from "./ConsoleLogger";

export class LogManager {
	static instance:LogManager = new LogManager();

	private loggers:Record<string,Logger> = {}
	private levels:Record<string,LogLevel> = {
		"": LogLevel.INFO
	}

	get defaultLevel():LogLevel {
		return this.levels[""]
	}
	set defaultLevel(level:LogLevel) {
		this.setLevel("", level);
	}
	setLevel(name:string, level:LogLevel) {
		this.levels[name] = level;
		for (let [k,v] of Object.entries(this.loggers)) {
			v.level = this.levelFor(k);
		}
	}

	protected levelFor(name:string):LogLevel {
		while (true) {
			if (name in this.levels) return this.levels[name];
			let i = name.lastIndexOf('.');
			if (i < 0) return this.defaultLevel;
			name = name.slice(0, i-1);
		}
	}

	protected createLogger(name:string):Logger {
		return new ConsoleLogger(name, this.levelFor(name));
	}

	loggerFor(name:string):Logger {
		this.loggers[name] ??= this.createLogger(name);
		return this.loggers[name]
	}

	static loggerFor(name:string):Logger {
		return LogManager.instance.loggerFor(name)
	}

	static setLevels(levels:Record<string,LogLevel>) {
		for (let [k, v] of Object.entries(levels)) {
			LogManager.instance.setLevel(k, v);
		}
	}
}
(window as any).LogManager = LogManager;
