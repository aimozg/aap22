/*
 * Created by aimozg on 05.03.2023.
 */
import {LayeredCanvas} from "../../utils/ui/LayeredCanvas";
import {GlyphLayer, GlyphSource} from "./GlyphLayer";
import {GameState} from "../GameState";
import {createElement, removeChildren} from "../../utils/ui/dom";
import {repeatString} from "../../utils/string";
import Chars from "../../utils/ui/chars";

export let FONTFACE = "IBMBIOS";
export let FONTSIZE = "32px";
export let FONT = `${FONTSIZE} ${FONTFACE}`;
export let CELLWIDTH = 32;
export let CELLHEIGHT = 32;

function richText(source:string):HTMLElement[] {
	let result:HTMLElement[] = [];
	let i = 0;
	let chunk = "";
	let cls = "";
	function flush() {
		if (chunk.length > 0) {
			result.push(createElement("span", {class:"text-"+cls},chunk));
		}
		chunk = "";
		cls = "";
	}
	while (i < source.length) {
		let c = source[i++];
		if (c === '\\' && i < source.length) {
			chunk += source[i++];
		} else if (c === '{') {
			flush();
			let j = source.indexOf(';', i);
			if (j > i) {
				cls = source.substring(i, j);
				i = j+1;
			}
		} else if (c === '}') {
			flush();
		} else {
			chunk += c;
		}
	}
	flush();
	return result;
}

export class ScreenManager {

	constructor(readonly root:HTMLElement) {}

	beforeRender?: ()=>void;
	topStatus: string = "";
	topMenu: HTMLDivElement;
	mainCanvas:LayeredCanvas;

	async setup() {
		this.topMenu = createElement("div",{class:"top"});
		this.mainCanvas = new LayeredCanvas({
			fill: '#222',
			dragPan: false,
			wheelZoom: false
		});
		this.root.append(this.topMenu);
		this.root.append(createElement("div",{},this.mainCanvas.element));

		// Load assets
		if (!document.fonts.check(FONT)) {
			for (let font of document.fonts.values()) {
				if (font.family === FONTFACE) {
					await font.load();
				}
			}
			/*
			await new Promise<void>((resolve)=>{
				document.fonts.addEventListener("loadingdone", ()=>{
					if (document.fonts.check(FONT)) resolve();
				})
			});
			 */
		}

		// Create layers
		let mobjLayerData:GlyphSource = {
			get width() { return GameState.mapWidth },
			get height() { return GameState.mapHeight },
			glyphAt(x: number, y: number){
				return GameState.level.cellAt({x,y}).glyph;
			}
		};
		let mobjLayer = new GlyphLayer("tiles", mobjLayerData, FONT, CELLWIDTH, CELLHEIGHT);
		// Setup canvas
		this.resizeCanvas();
		document.addEventListener("resize", ()=>{
			this.resizeCanvas();
		});
		this.mainCanvas.addLayer(mobjLayer);

		// Render loop
		let animationFrame = () => {
			this.render();
			requestAnimationFrame(animationFrame);
		}
		window.requestAnimationFrame(animationFrame);
	}
	private resizeCanvas() {
		this.mainCanvas.stretchToParentSize();
		this.mainCanvas.fitToShow({
			left: 0,
			right: CELLWIDTH*GameState.level.width,
			top: 0,
			bottom: CELLHEIGHT*GameState.level.height
		});
	}
	private render() {
		this.beforeRender?.();
		let status = this.getStatusLine();
		if (status !== this.topStatus) {
			this.topStatus = status;
			removeChildren(this.topMenu);
			this.topMenu.append(...richText(status));
		}
		this.mainCanvas.render();
	}

	getStatusLine():string {
		let player = GameState.player;

		let status = "";
		status += repeatString(Chars.LINE_HH, 10);
		status += " ";
		for (let x = 1; x <= player.speed; x++) {
			status += (player.ap >= x) ? Chars.CIRCLE_BLACK : Chars.CIRCLE_WHITE;
		}
		status += " ";
		status += repeatString(Chars.LINE_HH, 10);
		return status;
	}
}
