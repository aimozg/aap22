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
import {ParticleDef, ParticleLayer} from "./ParticleLayer";
import {XY} from "../../utils/geom";
import {DecalLayer} from "./DecalLayer";
import {ParticlePresetId, spawnParticle} from "./ParticlePresets";

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
	particleLayer: ParticleLayer;
	decalLayer: DecalLayer;
	private sideStatus: Element;

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
			<div class="sidebar">
				{this.sideStatus=<div class="sidestatus"></div>}
			</div>
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

		// Setup canvas
		document.addEventListener("resize", ()=>{
			this.resizeCanvas();
		});

		// Create layers
		let tileLayerData:GlyphSource = {
			get width() { return GameState.mapWidth },
			get height() { return GameState.mapHeight },
			glyphAt(x: number, y: number){
				let cell = GameState.level.cellAt({x,y});
				if (cell.objects.length > 0) return null;
				return cell.tile;
			}
		};
		let mobjLayerData:GlyphSource = {
			get width() { return GameState.mapWidth },
			get height() { return GameState.mapHeight },
			glyphAt(x: number, y: number){
				let mobj = GameState.level.cellAt({x,y}).topMobj();
				let glyph = mobj?.glyph;
				/*
				if (mobj && mobj.z > MapObject.Z_PLACEABLE && glyph && !glyph.bg) {
					glyph = Object.assign({bg:"#222"}, glyph);
				}
				 */
				return glyph;
			}
		};
		let glyphLayer = new GlyphLayer("tiles", tileLayerData, FONT, CELLWIDTH, CELLHEIGHT);
		this.mainCanvas.addLayer(glyphLayer);
		this.decalLayer = new DecalLayer("decals", 4);
		this.mainCanvas.addLayer(this.decalLayer);
		let mobjLayer = new GlyphLayer("mapObjects", mobjLayerData, FONT, CELLWIDTH, CELLHEIGHT);
		this.mainCanvas.addLayer(mobjLayer);
		this.particleLayer = new ParticleLayer("particless");
		this.particleLayer.defaultAZ = -16*CELLHEIGHT;
		this.particleLayer.defaultSize = 4;
		this.particleLayer.res = 4;
		this.mainCanvas.addLayer(this.particleLayer);

		// Render loop
		let t0 = 0;
		let animationFrame = (time:number) => {
			this.render(t0 ? (time-t0)/1000 : 0);
			t0 = time;
			requestAnimationFrame(animationFrame);
		}
		window.requestAnimationFrame(animationFrame);
	}
	resizeCanvas() {
		this.mainCanvas.stretchToParentSize();
		this.mainCanvas.setZoomFactor(1);
		/* fit entier map
		this.mainCanvas.fitToShow({
			x1: 0,
			x2: CELLWIDTH*GameState.level.width,
			y1: 0,
			y2: CELLHEIGHT*GameState.level.height
		});
		 */
	}
	private ft = 0;
	private frames = 0;
	private fps = 0;
	private render(dt:number) {
		this.beforeRender?.();
		this.ft += dt;
		if (this.ft > 1) {
			this.fps = this.frames;
			this.frames = 0;
			this.ft = 0;
		}
		let status = this.getStatusLine();
		if (status !== this.statusText) {
			this.statusText = status;
			removeChildren(this.topStatus);
			this.topStatus.append(...richText(status));
		}
		this.mainCanvas.setCenter({
			x: (GameState.player.pos.x+0.5)*CELLWIDTH,
			y: (GameState.player.pos.y+0.5)*CELLHEIGHT
		})
		this.particleLayer.update(dt);
		this.mainCanvas.render();
		this.frames++;
	}

	addParticle(def:ParticleDef) {
		this.particleLayer.addParticle(def);
	}
	shootParticlesFrom(count: number, gridXY:XY, direction:XY, type:ParticlePresetId) {
		while(count-->0) this.shootParticleFrom(gridXY, direction, type);
	}
	shootParticleFrom(gridXY:XY, direction:XY, type:ParticlePresetId) {
		let n:number;
		if (!direction.x) n = Math.abs(direction.y);
		else if (!direction.y) n = Math.abs(direction.x);
		else n = (direction.x**2+direction.y**2)**0.5;
		if (!n) n = 1;
		this.addParticle(spawnParticle(type,
			gridXY.x, gridXY.y, 0.5,
			direction.x/n, direction.y/n, 0))
	}

	getStatusLine():string {
		let player = GameState.player;

		let status = "";
		status += repeatString(Chars.LINE_HH, 10);
		status += " ";
		status += " SEED: "+String(GameState.seed).padEnd(6,' ');
		status += " AP: ";
		for (let x = 1; x <= player.apPerAction; x++) {
			status += (player.ap >= x) ? Chars.CIRCLE_BLACK : Chars.CIRCLE_WHITE;
		}
		status += " FPS: ";
		status += String(this.fps|0).padStart(2,' ');
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
