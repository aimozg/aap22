/*
 * Created by aimozg on 11.03.2023.
 */

import {createCanvas} from "../utils/ui/canvas";
import BitmapFontIBMVGA8x16 from "../../assets/ibmvga8";

export async function renderChars() {
	let s     = (await BitmapFontIBMVGA8x16).chars;
	let sz    = 32,
	    cprow = 32,
	    width = 32,
	    xshift = 16,
	    gap   = 0;
	let nrows = (s.length + cprow - 1) / cprow | 0;

	let sc                   = createCanvas((width + gap) * cprow, (sz + gap) * nrows);
	sc.font                  = `${sz}px IBMVGA8`;
	sc.textAlign             = "center";
	sc.textBaseline          = "top";
	sc.fillStyle             = '#fff';
	sc.imageSmoothingEnabled = false;

	for (let i = 0; i < s.length; i++) {
		let x = i % cprow, y = (i - x) / cprow;
		sc.fillText(s[i], x * (width + gap) + xshift, y * (sz + gap));
	}
	document.querySelector('.top')!.append(sc.canvas);
}
