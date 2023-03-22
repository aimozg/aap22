/*
 * Created by aimozg on 04.03.2023.
 */

import {AbstractCanvasLayer} from "./LayeredCanvas";
import {AnimatedColor, animatedColorToRGB} from "./canvas";
import {milliTime} from "../time";
import {XYRect} from "../grid/geom";
import {Dir8List} from "../grid/grid";

export interface GlyphData {
	ch: string;
	fg: AnimatedColor;
	stroke?: AnimatedColor;
	bg?: AnimatedColor;
	stretch?: boolean;
}

export interface GlyphSource {
	width: number;
	height: number;

	/**
	 * Return glyph(s) to display. Array element order is bottom-to-top.
	 */
	glyphAt(x: number, y: number): GlyphData[] | GlyphData | null | undefined;
}

export interface IGlyphFont {
	charWidth: number;
	charHeight: number;

	drawChar(target: CanvasRenderingContext2D,
	         char: string, color: string,
	         x: number, y: number,
	         scaleX?: number/* = 1*/, scaleY?: number/* = 1*/): void;
}

export class TextGlyphFont implements IGlyphFont {
	constructor(
		public readonly charWidth: number,
		public readonly charHeight: number,
		public readonly font: string
	) {}

	drawChar(target: CanvasRenderingContext2D, char: string, color: string, x: number, y: number, scaleX: number = 1, scaleY: number = 1): void {
		target.font         = this.font;
		target.fillStyle    = color;
		target.textAlign    = "left";
		target.textBaseline = "top";
		target.fillText(char, x, y);
	}

}

export class GlyphLayer extends AbstractCanvasLayer {
	constructor(id: string,
	            public readonly source: GlyphSource,
	            public readonly font: IGlyphFont,
	            public readonly cellWidth: number,
	            public readonly cellHeight: number) {
		super(id);
		this.scaleX = cellWidth / font.charWidth;
		this.scaleY = cellHeight / font.charHeight;
		this.scale  = Math.min(this.scaleX, this.scaleY);
		if (this.scaleX > this.scaleY) {
			this.dx = ((cellWidth - font.charWidth * this.scale) / 2) | 0;
		} else if (this.scaleX < this.scaleY) {
			this.dy = ((cellHeight - font.charHeight * this.scale) / 2) | 0;
		}
	}

	private scale: number;
	private scaleX: number;
	private scaleY: number;
	private dx: number = 0;
	private dy: number = 0;

	drawTo(dst: CanvasRenderingContext2D, visibleRect: XYRect): void {
		/*dst.font = this.font;
		dst.textBaseline = "middle";
		dst.textAlign = "center";
		*/
		let source = this.source;
		let minRow = Math.max(0, (visibleRect.y1 / this.cellHeight) | 0),
		    maxRow = Math.min(source.height, 1 + (visibleRect.y2 / this.cellHeight) | 0),
		    minCol = Math.max(0, (visibleRect.x1 / this.cellWidth) | 0),
		    maxCol = Math.min(source.width, 1 + (visibleRect.x2 / this.cellWidth) | 0);
		for (let row = minRow; row < maxRow; row++) {
			for (let col = minCol; col < maxCol; col++) {
				let glyph = source.glyphAt(col, row);
				if (glyph) {
					if (Array.isArray(glyph)) {
						for (let subglyph of glyph) {
							this.renderGlyph(dst, subglyph, col, row);
						}
					} else {
						this.renderGlyph(dst, glyph, col, row);
					}
				}
			}
		}
	}

	col2x(col: number): number {
		return col * this.cellWidth
	}

	row2y(row: number): number {
		return row * this.cellHeight
	}


	renderGlyph(c2d: CanvasRenderingContext2D, glyph: GlyphData, col: number, row: number) {
		let phase = milliTime() / 1000;
		let x     = this.col2x(col);
		let y     = this.row2y(row);
		if (glyph.bg) {
			c2d.fillStyle = animatedColorToRGB(glyph.bg, phase).toString();
			c2d.fillRect(x, y, this.cellWidth, this.cellHeight)
		}
		if (glyph.ch && glyph.ch !== ' ') {
			let scaleX = glyph.stretch ? this.scaleX : this.scale;
			let scaleY = glyph.stretch ? this.scaleY : this.scale;
			let dx     = glyph.stretch ? 0 : this.dx;
			let dy     = glyph.stretch ? 0 : this.dy;
			if (glyph.stroke) {
				let stroke = animatedColorToRGB(glyph.stroke, phase).toString();
				for (let dir of Dir8List) {
					this.font.drawChar(c2d, glyph.ch, stroke,
						x + dx + dir.dx * scaleX, y + dy + dir.dy * scaleY,
						scaleX, scaleY);
				}
			}
			let fg = animatedColorToRGB(glyph.fg, phase).toString();
			this.font.drawChar(c2d, glyph.ch, fg, x + dx, y + dy, scaleX, scaleY);
		}
	}
}
