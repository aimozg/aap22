/*
 * Created by aimozg on 04.07.2022.
 */
import {Logger, LogLevel} from "./Logger";

export class NopLogger extends Logger {
	doLog(level: LogLevel, message: string, ...rest: unknown[]): void {
	}

	constructor() {
		super(LogLevel.NONE);
	}

	protected shouldLog(level: LogLevel): boolean {
		return false;
	}

}
