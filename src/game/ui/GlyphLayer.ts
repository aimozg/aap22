/*
 * Created by aimozg on 04.03.2023.
 */

import {AbstractCanvasLayer} from "../../utils/ui/LayeredCanvas";
import {AnimatedColor, animatedColorToRGB, RGBColor} from "../../utils/ui/canvas";
import {milliTime} from "../../utils/time";

export interface GlyphData {
	ch: string;
	fg: AnimatedColor;
	bg?: RGBColor | null;
}

export interface GlyphSource {
	width: number;
	height: number;

	glyphAt(x: number, y: number): GlyphData | null | undefined;
}

export class GlyphLayer extends AbstractCanvasLayer {
	constructor(id: string,
				public readonly source: GlyphSource,
	            public readonly font: string,
	            public readonly cellWidth: number,
	            public readonly cellHeight: number) {
		super(id);
	}

	drawTo(dst: CanvasRenderingContext2D): void {
		dst.font = this.font;
		dst.textBaseline = "middle";
		dst.textAlign = "center";
		let source = this.source;
		for (let row = 0; row < source.height; row++) {
			for (let col = 0; col < source.width; col++) {
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
			c2d.fillStyle = animatedColorToRGB(glyph.fg, phase).toString();
			c2d.fillText(glyph.ch, this.cellWidth/2 + x, y + this.cellHeight/2)
		}
	}
}
