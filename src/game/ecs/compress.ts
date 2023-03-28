/*
 * Created by aimozg on 16.03.2023.
 */

import {EntityJson} from "./EntityLoader";
import {ByteBuffer} from "../../utils/ByteBuffer";

interface Visitor {
	buffer(value:Uint8Array):void;
	uint8(value:number):void;
	uint16(value:number):void;
	uint32(value:number):void;
	float64(value:number):void;
	string(value:string):void;
}

function visitInteger(value:number, visitor:Visitor) {
	value |= 0;
	if (value >= 0 && value < 63) {
		visitor.uint8(value);
		return;
	}
	let sign = 0;
	if(value < 0) {
		sign = 0b0100_0000; // sign bit
		value = -value;
	}
	let x = value&0b0011_1111 | sign;
	value >>= 6;
	if (value) {
		x |= 0b1000_0000; // continuation bit
	}
	visitor.uint8(x)
	while(value) {
		x = value&0b0111_1111;
		value >>= 7;
		if (value) x |= 0b1000_0000;
		visitor.uint8(x);
	}
}
function readInteger(bb:ByteBuffer):number {
	let byte = bb.readUint8();
	let sgn = byte & 0b0100_0000;
	let value = byte & 0b0011_1111;
	let offset = 6;
	while (byte & 0b1000_0000) {
		byte = bb.readUint8();
		let x = byte & 0b0111_1111;
		value += (x << offset);
		offset += 7;
	}
	if (sgn) value = -value;
	return value;
}

function visitArray<T>(array:T[], visitor:Visitor, callback:(element:T, index:number, array:T[])=>void) {
	visitInteger(array.length, visitor);
	array.forEach(callback);
}

function visitAny(value:any, visitor:Visitor) {
	if (value === undefined) visitor.uint8(0);
	else if (value === null) visitor.uint8(1);
	else if (value === true) visitor.uint8(2);
	else if (value === false) visitor.uint8(3);
	else if (typeof value === "number") {
		if (value === (value|0)) {
			visitor.uint8(4);
			visitInteger(value,visitor);
		} else {
			visitor.uint8(5);
			visitor.float64(value);
		}
	} else if (typeof value === "string") {
		visitor.uint8(6);
		visitor.string(value);
	} else if (Array.isArray(value)) {
		if (value.every(x=>typeof x === "number" && x === (x|0))) {
			// int[]
			visitor.uint8(9);
			visitArray(value, visitor, element => visitInteger(element, visitor));
		} else {
			// any[]
			visitor.uint8(7);
			visitArray(value, visitor, element => visitAny(element, visitor));
		}
	} else {
		visitor.uint8(8);
		visitMapOfAny(value, visitor);
	}
}
function visitMapOfAny(value:object, visitor:Visitor) {
	visitArray(Object.entries(value), visitor, ([k,v])=>{
		visitor.string(k);
		visitAny(v,visitor);
	});
}
function visitEntityJson(json:EntityJson, visitor:Visitor) {
	visitor.string(json.clsid);
	if (json.bpid) visitor.string(json.bpid);
	else visitor.uint32(0);
	visitor.uint32(json.uuid);
	visitMapOfAny(json.stats ?? {}, visitor);
	visitArray(json.components ?? [], visitor, entity=>visitEntityJson(entity,visitor));
	visitArray(json.effects ?? [], visitor, entity=>visitEntityJson(entity,visitor));
	visitArray(json.children ?? [], visitor, ([pos,entity])=>{
		visitAny(pos, visitor);
		visitEntityJson(entity,visitor);
	});
	visitMapOfAny(json.data ?? {}, visitor);
}

const MAGIC = 0x41524c45;
const VERSION_LATEST = 1;
class PreparingVisitor implements Visitor {
	constructor() {
		this.strings = new Map<string,number>();
	}
	size = 0;
	strings:Map<string,number>;
	buffer(value:Uint8Array) { this.size += value.byteLength };
	uint8(x:number) { this.size += 1 };
	uint16(x:number) { this.size += 2 };
	uint32(x:number) { this.size += 4 };
	float64(x:number) { this.size += 8};
	string(value:string) {
		if (!this.strings.has(value)) {
			this.strings.set(value, this.strings.size);
		}
		this.size += 4
	}
}
class WritingVisitor implements Visitor {
	constructor(
		private strings:Map<string,number>,
		private output: ByteBuffer,
	) {}
	buffer(x:Uint8Array) {
		this.output.writeBytes(x);

	};
	uint8(x:number) {
		this.output.writeUint8(x);
	};
	uint16(x:number) {
		this.output.writeUint16(x);
	};
	uint32(x:number) {
		this.output.writeUint32(x);
	};
	float64(x:number) {
		this.output.writeFloat64(x);
	};
	string(value:string) {
		this.uint32(this.strings.get(value)!);
	}
}
export function compressEntityJson(json:EntityJson): ArrayBuffer {
	// TODO can serialize in place and record string positions, then replace them with uint32
	let sizeCounter = new PreparingVisitor();
	sizeCounter.strings.set("",0);
	visitEntityJson(json, sizeCounter);
	// calc header size
	sizeCounter.uint32(MAGIC); // magic
	sizeCounter.uint32(VERSION_LATEST); // version
	// strings
	visitInteger(sizeCounter.strings.size, sizeCounter);
	let encoder = new TextEncoder();
	let encodedStrings:Uint8Array[] = [];
	sizeCounter.strings.forEach((_,string)=>{
		let utf8 = encoder.encode(string);
		encodedStrings[_] = utf8;
		visitInteger(utf8.length, sizeCounter);
		sizeCounter.size += utf8.length;
	});

	// actual encoding

	let buffer = new ByteBuffer(sizeCounter.size);
	let writer = new WritingVisitor(sizeCounter.strings, buffer);

	// header
	writer.uint32(MAGIC);
	writer.uint32(VERSION_LATEST);
	visitArray(encodedStrings, writer, string=>{
		visitInteger(string.length, writer);
		writer.buffer(string);
	});
	// entity
	visitEntityJson(json, writer);

	return buffer.buffer;
}
function iterArray(bb:ByteBuffer, callback:(bb:ByteBuffer, index:number)=>void) {
	let length = readInteger(bb);
	for (let i = 0; i < length; i++) {
		callback(bb,i);
	}
}
function readArray<T>(bb:ByteBuffer, factory:(bb:ByteBuffer, index:number)=>T):T[] {
	let out:T[] = [];
	iterArray(bb,(bb,i)=>{
		out[i] = factory(bb, i);
	})
	return out;
}
function readString(bb:ByteBuffer, strings:Map<number,string>):string {
	let n = bb.readUint32();
	let s = strings.get(n);
	if (s === undefined) throw new Error(`Unknown String#${n}`);
	return s;
}
function readAny(bb:ByteBuffer, strings:Map<number,string>):unknown {
	let type = bb.readUint8();
	switch (type) {
		case 0: return undefined;
		case 1: return null;
		case 2: return true;
		case 3: return false;
		case 4: return readInteger(bb);
		case 5: return bb.readFloat64();
		case 6: return readString(bb, strings);
		case 7: return readArray(bb, bb=>readAny(bb,strings));
		case 8: return readMapOfAnyOrNull(bb,strings) ?? {};
		case 9: return readArray(bb, bb=>readInteger(bb));
		default:
			throw new Error(`Bad BinaryAny type ${type}`)
	}
}
function readMapOfAnyOrNull(bb:ByteBuffer, strings:Map<number,string>):null|Record<string,unknown> {
	let out:Record<string,unknown> = {};
	let empty = true;
	iterArray(bb, (bb)=>{
		empty = false;
		let key = readString(bb,strings);
		let value = readAny(bb,strings);
		out[key] = value;
	})
	return empty ? null : out;
}
function readEntity(bb:ByteBuffer,strings:Map<number,string>):EntityJson {
	let clsid = readString(bb,strings);
	let bpid = readString(bb,strings);
	let uuid = bb.readUint32();
	let stats = readMapOfAnyOrNull(bb, strings);
	let components = readArray(bb, bb=>readEntity(bb,strings));
	let effects = readArray(bb, bb=>readEntity(bb,strings));
	let children = readArray(bb, bb=>{
		let pos = readAny(bb,strings);
		let child = readEntity(bb,strings);
		return [pos,child] as [unknown,EntityJson]
	});
	let data = readMapOfAnyOrNull(bb, strings);

	let out:EntityJson = {
		clsid, uuid
	};
	if (bpid) out.bpid = bpid;
	if (data) out.data = data;
	if (components.length > 0) out.components = components;
	if (effects.length > 0) out.effects = effects;
	if (stats) out.stats = stats;
	if (children.length>0) out.children=children;

	return out;
}
export function decompressEntityJson(buffer:ArrayBuffer):EntityJson {
	let bb = new ByteBuffer(buffer);
	let magic = bb.readUint32();
	let version = bb.readUint32();
	if (magic !== MAGIC && version !== VERSION_LATEST) throw new Error(`Invalid binary header ${magic}, ${version}`);
	// strings
	let strings = new Map<number,string>();
	let decoder = new TextDecoder();
	iterArray(bb,(bb,i)=>{
		let strlen = readInteger(bb);
		let bytes = bb.readBytes(strlen);
		strings.set(i,decoder.decode(bytes));
	});
	return readEntity(bb, strings);
}
