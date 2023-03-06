/*
 * Created by aimozg on 05.03.2023.
 */
import {LayeredCanvas} from "../../utils/ui/LayeredCanvas";
import {GlyphLayer, GlyphSource} from "./GlyphLayer";
import {GameState} from "../GameState";
import {createElement, removeChildren} from "../../utils/ui/dom";
import {repeatString, substitutePattern} from "../../utils/string";
import Chars from "../../utils/ui/chars";
import {Entity} from "../Entity";
import {Creature} from "../core/Creature";
import {objectClassName} from "../../utils/types";
import jsx from "texsaur";

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
			let props:Record<string,any> = {};
			if (cls) {
				if (cls[0] === '#') {
					props.style = "color: "+cls;
				} else {
					props.class = "text-" + cls;
				}
			}
			result.push(createElement("span", props,chunk));
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
			if (j > i && j < source.indexOf('}', i)) {
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

	constructor() {}

	beforeRender?: ()=>void;
	private statusText: string      = "";
	private logLength: number      = 0;
	static LOG_LIMIT = 2*960/8;
	private topStatus: Element;
	private topLog: Element;
	private mainCanvas:LayeredCanvas;

	async setup() {
		this.mainCanvas = new LayeredCanvas({
			fill: '#222',
			dragPan: false,
			wheelZoom: false
		});
		document.body.append(<main>
			<div></div>
			<div class="top">
				{this.topStatus=<div class="topstatus"></div>}
				{this.topLog=<div class="toplog"></div>}
			</div>
			<div></div>
			<div></div>
			<div class="divcanvas">
				{this.mainCanvas.element}
			</div>
			<div class="sidebar"></div>
			<div></div>
		</main>);

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
	resizeCanvas() {
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
		if (status !== this.statusText) {
			this.statusText = status;
			removeChildren(this.topStatus);
			this.topStatus.append(...richText(status));
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

	formatTag(obj:Entity, key:string):string {
		if (obj instanceof Creature) {
			switch (key) {
				case "":
					return `{1;${obj.name}}`
				case "s":
					// if plural return ""
					return "s";
				case "es":
					// if plural return ""
					return "es";
			}
		}
		return `{error;Unknown key ${objectClassName(obj)}.${key}}`
	}
	logsub(message: string, substitutions: Record<string, string | Entity | number>) {
		message = substitutePattern(message, str=>{
			if (str.includes(';')) return undefined;
			let parts = str.split('.');
			let objname = parts[0];
			let propname = parts[1] ?? "";
			let object = substitutions[objname];
			if (!object) return undefined;
			if (object instanceof Entity) return this.formatTag(object, propname);
			if (typeof object === "number") {
				// TODO use propname to format the number
				return String(object);
			}
			return String(object);
		});
		this.log(message);
	}
	log(message:string){
		let elements = richText(message);
		this.topLog.append(...elements);
		this.logLength += elements.map(e=>e.textContent?.length??0).reduce((a,b)=>a+b);
		let delchars = this.logLength - ScreenManager.LOG_LIMIT;
		while (delchars > 0) {
			let el = this.topLog.firstElementChild;
			if (!el) break;
			let n = el.textContent!.length;
			if (delchars >= n) {
				this.topLog.removeChild(el);
				this.logLength -= n;
				delchars -= n;
			} else {
				this.logLength -= delchars;
				el.textContent = el.textContent!.substring(delchars);
				delchars = 0;
			}
		}
	}
}
