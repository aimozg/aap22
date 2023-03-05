/*
 * Created by aimozg on 04.07.2022.
 */

import {isPlainObject} from "../types";

export abstract class Logger {
	protected constructor(public level:LogLevel) {
	}

	abstract doLog(level:LogLevel, message:string, ...rest:any[]):void;

	protected shouldLog(level:LogLevel):boolean {
		return level >= this.level;
	}

	log(level:LogLevel, message:string, ...rest:any[]) {
		if (this.shouldLog(level)) {
			if ((message as any) instanceof Error) {
				rest = [message]
				message = "{}"
			} else if (typeof message !== "string") {
				message = String(message)
			}
			this.doLog(level, message, ...rest);
		}
	}
	trace(message:string, ...rest:any[]) {
		this.log(LogLevel.TRACE, message, ...rest);
	}
	debug(message:string, ...rest:any[]) {
		this.log(LogLevel.DEBUG, message, ...rest);
	}
	info(message:string, ...rest:any[]) {
		this.log(LogLevel.INFO, message, ...rest);
	}
	warn(message:string, ...rest:any[]) {
		this.log(LogLevel.WARNING, message, ...rest);
	}
	error(message:string, ...rest:any[]) {
		this.log(LogLevel.ERROR, message, ...rest);
	}
	fatal(message:string, ...rest:any[]) {
		this.log(LogLevel.FATAL, message, ...rest);
	}

	static toString(x:any):string {
		if (typeof x === 'string') return x;
		if (typeof x === 'function') return x.name;
		if (Array.isArray(x)) {
			if (x.length > 20) {
				return "["+x.slice(0,20).map(c=>Logger.toString(c)).join(", ")+", ...]"
			}
			return "["+x.map(c=>Logger.toString(c)).join(", ")+"]"
		}
		let s = isPlainObject(x) ? safeStringify(x) : String(x);
		if (s === '[object Object]') s = '[object '+Object.getPrototypeOf(x).constructor.name+']';
		return s
	}
	static formatMessage(message:string, ...rest:any[]): [string, any[]] {
		let s = message.replace(/\{}/g, ()=> {
			let x = rest.length === 0 ? "[[missing argument]]" : rest.splice(0, 1)[0];
			return Logger.toString(x);
		});
		return [s,rest];
	}
}

function safeStringify(o:any):string {
	try {
		return JSON.stringify(o);
	} catch (e) {
		return String(o);
	}
}

export enum LogLevel {
	ALL,
	TRACE,
	DEBUG,
	INFO,
	WARNING,
	ERROR,
	FATAL,
	NONE
}
