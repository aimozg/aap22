/*
 * Created by aimozg on 03.12.2022.
 */

import * as tinycolor from "tinycolor2";
import {lint} from "../math/utils";

export type RGBColor = tinycolor.Instance;

export let Colors = {
	WHITE: '#FFF',
	LIGHTGRAY: '#AAA',
	DARKGRAY: '#555',
	BLACK: '#000',
	RED: '#A00',
	ORANGE: '#A50',
	YELLOW: '#AA0',
	GREEN: '#0A0',
	CYAN: '#0AA',
	BLUE: '#05A',
	PURPLE: '#50A',
	MAGENTA: '#A0A',
	LIGHTRED: '#F22',
	LIGHTORANGE: '#F82',
	LIGHTYELLOW: '#FF2',
	LIGHTGREEN: '#2F2',
	LIGHTCYAN: '#2FF',
	LIGHTBLUE: '#28F',
	LIGHTPURPLE: '#82F',
	LIGHTMAGENTA: '#F2F',
	BROWN: '#740'
}

export function createCanvas(w: number, h: number, fill?: string): CanvasRenderingContext2D {
	let c = document.createElement("canvas");
	c.width = w;
	c.height = h;
	let c2d = c.getContext('2d')!;
	if (fill) {
		c2d.fillStyle = fill;
		c2d.fillRect(0, 0, w, h);
	}
	return c2d;
}

export interface AnimatedColor1 {
	fx: "brighten" | "darken" | "white";
	speed: "normal" | "fast" | "blink" | "fblink" | "slow";
	color: RGBColor;
}

export interface AnimatedColor2 {
	fx: "tween";
	speed: "normal" | "fast" | "slow";
	colors: RGBColor[]
}

export type AnimatedColor = string | RGBColor | AnimatedColor1 | AnimatedColor2;

export function animatedColorToRGB(color: AnimatedColor, phase: number): RGBColor {
	if (color instanceof tinycolor) {
		return color;
	}
	if (typeof color === 'string') {
		return tinycolor(color);
	}
	switch (color.speed) {
		case "normal":
			// phase = phase
			break;
		case "fast":
			phase = phase * 2;
			break;
		case "slow":
			phase = phase / 2;
			break;
		case "blink":
			phase = (phase - Math.floor(phase)) > 0.75 ? 0.5 : 0;
			break;
		case "fblink":
			phase = phase * 2;
			phase = (phase - Math.floor(phase)) > 0.75 ? 0.5 : 0;
			break;
	}
	phase = phase - Math.floor(phase);
	// a /\ graph between (0,0), (0.5,1) and (1,0)
	let tphase = 1 - Math.abs(phase - 0.5) * 2;
	switch (color.fx) {
		case "tween":
			if (color.colors.length === 0) throw new Error(`No colors specified`)
			if (color.colors.length === 1) return color.colors[0];
			// 0..1 -> 0..N
			phase = color.colors.length;
			let i = Math.floor(phase), f = phase - i;
			if (f === 0) return color.colors[i];
			let color1 = color.colors[i].toRgb(), color2 = color.colors[i].toRgb();
			return tinycolor({
				r: lint(f, color1.r, color2.r),
				g: lint(f, color1.g, color2.g),
				b: lint(f, color1.b, color2.b),
				a: lint(f, color1.a, color2.a),
			})
		case "white":
			let rgb = color.color.toRgb();
			return tinycolor({
				r: lint(phase*2, rgb.r, 255),
				g: lint(phase*2, rgb.g, 255),
				b: lint(phase*2, rgb.b, 255),
				a: rgb.a
			});
		case "brighten":
			return color.color.clone().brighten(tphase * 50);
		case "darken":
			phase = 1 - Math.abs(phase - 0.5) * 2;
			return color.color.clone().darken(tphase * 50);
	}
}

