/*
 * Created by aimozg on 11.03.2023.
 */

import {XY} from "../grid/geom";
import {createCanvas} from "./canvas";
import {getOrPut} from "../collections";

export interface BitmapFontDef {
	charWidth: number;
	charHeight: number;
	gapx?: number;
	gapy?: number;
	chars: string[];
	placeholderChar?: string;
}

export class BitmapFont {
	static cacheSize = 8;

	constructor(
		def: BitmapFontDef,
		bitmap: ImageBitmap
	) {
		this.charWidth   = def.charWidth;
		this.charHeight  = def.charHeight;
		this.charsPerRow = (bitmap.width / this.charWidth) | 0;
		this.gapx        = def.gapx ?? 0;
		this.gapy        = def.gapy ?? 0;
		this.mulx        = (this.charWidth + this.gapx);
		this.muly        = (this.charHeight + this.gapy);
		this.bitmap      = bitmap;

		this.cc2pos = new Map();
		def.chars.forEach((rowchars, rowno) => {
			for (let colno = 0; colno < rowchars.length; colno++) {
				let cc = rowchars.charCodeAt(colno);
				this.cc2pos.set(cc, (rowno << 16) + colno);
			}
		});

		this.tempCanvas     = createCanvas(this.charWidth, this.charHeight);
		let placeholderCC   = def.placeholderChar?.charCodeAt(0) ?? '?'.charCodeAt(0);
		this.placeholderPos = this.cc2pos.get(placeholderCC) ?? 0;

		this.cache = new Map();
	}

	readonly charWidth: number;
	readonly charHeight: number;
	private readonly charsPerRow: number;
	private readonly mulx: number;
	private readonly muly: number;
	private readonly gapx: number;
	private readonly gapy: number;
	private readonly placeholderPos: number;

	private readonly tempCanvas: CanvasRenderingContext2D;
	// char code -> (y << 16) + x
	private readonly cc2pos: Map<number, number>;
	private readonly bitmap: ImageBitmap;
	private readonly cache: Map<number, Map<string, CanvasRenderingContext2D>>;

	bitmapPosOfChar(char: string|number): XY {
		let cc  = typeof char === 'number' ? char : char.charCodeAt(0);
		let pos = this.cc2pos.get(cc) ?? this.placeholderPos;
		let col = pos & 0xffff,
		    row = pos >>> 16;
		return {x: col * this.mulx, y: row * this.muly};
	}

	drawWhiteChar(target: CanvasRenderingContext2D,
	              char: string,
	              x: number, y: number,
	              scaleX: number = 1, scaleY: number = 1) {
		let srcxy = this.bitmapPosOfChar(char);
		target.drawImage(this.bitmap,
			// sx sy sw sh
			srcxy.x, srcxy.y, this.charWidth, this.charHeight,
			// dx dy dw dh
			x, y, this.charWidth * scaleX, this.charHeight * scaleY);
	}

	private createColoredChar(
		cc: number,
		color: string
	): CanvasRenderingContext2D {
		// performance.mark("createColoredChar-start");
		let srcxy      = this.bitmapPosOfChar(cc);
		let charWidth  = this.charWidth;
		let charHeight = this.charHeight;
		let canvas:CanvasRenderingContext2D;
		if (BitmapFont.cacheSize) {
			canvas = createCanvas(charWidth,charHeight);
		} else {
			canvas = this.tempCanvas;
			canvas.clearRect(0, 0, charWidth, charHeight);
		}
		canvas.globalCompositeOperation = "source-over";
		canvas.drawImage(this.bitmap,
			srcxy.x, srcxy.y, charWidth, charHeight,
			0, 0, charWidth, charHeight);
		canvas.globalCompositeOperation = "source-atop";
		canvas.fillStyle                = color;
		canvas.fillRect(0, 0, charWidth, charHeight);
		if (BitmapFont.cacheSize) {
			let chars = getOrPut(this.cache, cc, ()=>new Map());
			chars.set(color, canvas);
			if (chars.size > BitmapFont.cacheSize) {
				chars.delete(chars.keys().next());
			}
		}
		// performance.mark("createColoredChar-end");
		// performance.measure("createColoredChar","createColoredChar-start","createColoredChar-end");
		return canvas;
	}

	private getColoredChar(
		cc: number,
		color: string
	): CanvasRenderingContext2D {
		return this.cache.get(cc)?.get(color) ?? this.createColoredChar(cc, color);
	}

	drawChar(target: CanvasRenderingContext2D,
	         char: string, color: string,
	         x: number, y: number,
	         scaleX: number = 1, scaleY: number = 1) {
		if (color === "white" || color === "#fff" || color === "#ffffff" || color == "#ffffffff") {
			this.drawWhiteChar(target, char, x, y, scaleX, scaleY);
			return;
		}
		// performance.mark("drawChar-start");
		let charWidth   = this.charWidth;
		let charHeight  = this.charHeight;
		let coloredChar = this.getColoredChar(char.charCodeAt(0), color);
		// performance.mark("drawChar-recolor-end");

		target.drawImage(coloredChar.canvas,
			// sx sy sw sh
			0, 0, charWidth, charHeight,
			// dx dy dw dh
			x, y, charWidth * scaleX, charHeight * scaleY);
		// performance.mark("drawChar-end");
		// performance.measure("drawChar","drawChar-start","drawChar-end");
	}

	static async fromDataURL(def: BitmapFontDef, bitmapDataUrl: string): Promise<BitmapFont> {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			let i = new Image();
			i.addEventListener("load", () => {
				resolve(i);
			});
			i.addEventListener("error", (e) => {
				reject(new Error("Error loading Image"));
			});
			i.src = bitmapDataUrl;
		})
			.then(img => createImageBitmap(img))
			.then(ibmp => new BitmapFont(def, ibmp));
	}
}
