/*
 * Created by aimozg on 16.03.2023.
 */

export class ByteBuffer {
	constructor(size:number);
	constructor(buffer:ArrayBuffer);
	constructor(arg0:number|ArrayBuffer) {
		if (typeof arg0 === "number") {
			this.buffer = new ArrayBuffer(arg0);
		} else {
			this.buffer = arg0;
		}
		this.dv = new DataView(this.buffer);
	}
	buffer: ArrayBuffer;
	dv: DataView;
	pos = 0;

	writeBytes(src:ArrayLike<number>) {
		new Int8Array(this.buffer, this.pos).set(src);
		this.pos += src.length;
	}
	writeUint8(x:number) {
		this.dv.setUint8(this.pos, x);
		this.pos += 1;
	}
	writeUint16(x:number) {
		this.dv.setUint16(this.pos, x);
		this.pos += 2;
	}
	writeUint32(x:number) {
		this.dv.setUint32(this.pos, x);
		this.pos += 4;
	}
	writeFloat64(x:number) {
		this.dv.setFloat64(this.pos, x);
		this.pos += 8;
	}
	readBytes(n:number):Int8Array;
	readBytes(dst:Int8Array):Int8Array;
	readBytes(arg1:number|Int8Array):Int8Array {
		let dst:Int8Array;
		if (typeof arg1 === "number") {
			if (arg1 === 0) return new Int8Array(0)
			dst = new Int8Array(arg1);
		} else {
			dst = arg1;
		}
		dst.set(new Int8Array(this.buffer, this.pos, dst.length));
		this.pos += dst.length;
		return dst;
	}
	readUint8():number {
		let x = this.dv.getUint8(this.pos);
		this.pos += 1;
		return x;
	}
	readUint16():number {
		let x = this.dv.getUint16(this.pos);
		this.pos += 2;
		return x;
	}
	readUint32():number {
		let x = this.dv.getUint32(this.pos);
		this.pos += 4;
		return x;
	}
	readFloat64():number {
		let x = this.dv.getFloat64(this.pos);
		this.pos += 8;
		return x;
	}
}
