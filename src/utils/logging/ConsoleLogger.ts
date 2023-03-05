/*
 * Created by aimozg on 04.07.2022.
 */
import {Logger, LogLevel} from "./Logger";

export class ConsoleLogger extends Logger {
	static TAG_LENGTH = 20;
	constructor(private name:string, level:LogLevel) {
		super(level);
		let tag:string;
		if (name.length <= ConsoleLogger.TAG_LENGTH) {
			// "com.package.Class" ->
			// "[   com.package.Class]"
			tag = name;
		} else {
			let parts = name.split(/\./g);
			let classname = parts.splice(-1, 1)[0];
			if (classname.length >= ConsoleLogger.TAG_LENGTH) {
				// "com.package.SoLongNoPointShorteningPackages" ->
				// "[SoLongNoPointShorten]"
				tag = classname.substring(0, ConsoleLogger.TAG_LENGTH);
			} else {
				tag = classname;
				let i = 0;
				// "com.game.utils.etc.ClassName" -> (>20)
				// "c.game.utils.etc.ClassName" -> (>20)
				// "c.g.utils.etc.ClassName" -> (>20)
				// "c.g.u.etc.ClassName" -> (<=20)
				// "[ c.g.u.etc.ClassName]"
				while(true) {
					let abbr = parts.join('.') + '.' +tag;
					if (abbr.length <= ConsoleLogger.TAG_LENGTH) {
						tag = abbr;
						break;
					}
					if (i >= parts.length) {
						// "com.game.utils.misc.other.stuff.LongClassName" ->
						// "c.g.u.m.o.s.LongClassName" -> (too long)
						// "[.stuff.LongClassName]
						tag = classname.substring(classname.length - ConsoleLogger.TAG_LENGTH);
						break;
					}
					parts[i] = parts[i][0];
					i++;
				}
			}
		}
		this.tag = "["+tag.padStart(ConsoleLogger.TAG_LENGTH, " ")+"]"
	}
	private readonly tag:string;

	doLog(level: LogLevel, message: string, ...rest: any[]): void {
		[message,rest] = Logger.formatMessage(message, ...rest);
		const dt = ((new Date().getTime()-t0)/1000).toFixed(3).padStart(7, ' ');
		switch (level) {
			case LogLevel.ERROR:
			case LogLevel.FATAL:
				console.error(dt, this.tag, message, ...rest);
				break;
			case LogLevel.WARNING:
				console.warn(dt, this.tag, message, ...rest);
				break;
			case LogLevel.INFO:
				console.info(dt, this.tag, message, ...rest);
				break;
			case LogLevel.DEBUG:
			case LogLevel.TRACE:
			default:
				console.debug(dt, this.tag, message, ...rest);
		}
	}
}
const t0 = new Date().getTime();
