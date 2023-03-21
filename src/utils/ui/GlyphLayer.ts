/*
 * Created by aimozg on 04.03.2023.
 */

import {AbstractCanvasLayer} from "./LayeredCanvas";
import {AnimatedColor, animatedColorToRGB} from "./canvas";
import {milliTime} from "../time";
import {BitmapFont} from "./BitmapFont";
import {XYRect} from "../grid/geom";
import {Dir8List} from "../grid/grid";

export interface GlyphData {
	ch: string;
	fg: AnimatedColor;
	stroke?: AnimatedColor;
	bg?: AnimatedColor;
}

export interface GlyphSource {
	width: number;
	height: number;

	glyphAt(x: number, y: number): GlyphData | null | undefined;
}

export class GlyphLayer extends AbstractCanvasLayer {
	constructor(id: string,
				public readonly source: GlyphSource,
	            public readonly font: BitmapFont,
	            public readonly cellWidth: number,
	            public readonly cellHeight: number) {
		super(id);
		this.scaleX = this.cellWidth/font.charWidth;
		this.scaleY = this.cellHeight/font.charHeight;
	}
	private scaleX: number;
	private scaleY: number;

	drawTo(dst: CanvasRenderingContext2D, visibleRect: XYRect): void {
		/*dst.font = this.font;
		dst.textBaseline = "middle";
		dst.textAlign = "center";
		*/
		let source = this.source;
		let minRow = Math.max(0, (visibleRect.y1/this.cellHeight)|0),
		    maxRow = Math.min(source.height, 1+(visibleRect.y2/this.cellHeight)|0),
		    minCol = Math.max(0, (visibleRect.x1/this.cellWidth)|0),
		    maxCol = Math.min(source.width, 1+(visibleRect.x2/this.cellWidth)|0);
		for (let row = minRow; row < maxRow; row++) {
			for (let col = minCol; col < maxCol; col++) {
				let glyph = source.glyphAt(col, row);
				if (glyph) this.renderGlyph(dst, glyph, col, row);
			}
		}
	}

	col2x(col:number):number {
		return col * this.cellWidth
	}
	row2y(row:number):number {
		return row * this.cellHeight
	}


	renderGlyph(c2d: CanvasRenderingContext2D, glyph:GlyphData, col:number, row:number) {
		let phase = milliTime()/1000;
		let x = this.col2x(col);
		let y = this.row2y(row);
		if (glyph.bg) {
			c2d.fillStyle = animatedColorToRGB(glyph.bg, phase).toString();
			c2d.fillRect(x, y, this.cellWidth, this.cellHeight)
		}
		if (glyph.ch && glyph.ch !== ' ') {
			if (glyph.stroke) {
				let stroke = animatedColorToRGB(glyph.stroke, phase).toString();
				for (let dir of Dir8List) {
					this.font.drawChar(c2d, glyph.ch, stroke, x+dir.dx*this.scaleX,y+dir.dy*this.scaleY, this.scaleX, this.scaleY);
				}
			}
			/*
			c2d.fillStyle = animatedColorToRGB(glyph.fg, phase).toString();
			c2d.fillText(glyph.ch, this.cellWidth/2 + x, y + this.cellHeight/2)
			 */
			let fg = animatedColorToRGB(glyph.fg, phase).toString();
			this.font.drawChar(c2d, glyph.ch, fg, x, y, this.scaleX, this.scaleY);
		}
	}
}
