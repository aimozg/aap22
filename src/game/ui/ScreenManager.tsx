/*
 * Created by aimozg on 05.03.2023.
 */
import {LayeredCanvas} from "../../utils/ui/LayeredCanvas";
import {GlyphLayer, GlyphSource} from "../../utils/ui/GlyphLayer";
import {GameState} from "../GameState";
import {createElement, removeChildren} from "../../utils/ui/dom";
import {substitutePattern} from "../../utils/string";
import Chars from "../../utils/ui/chars";
import {Entity} from "../Entity";
import {Creature} from "../core/Creature";
import {objectClassName} from "../../utils/types";
import jsx from "texsaur";
import {ParticleDef, ParticleLayer} from "../../utils/ui/ParticleLayer";
import {XY} from "../../utils/grid/geom";
import {DecalLayer} from "../../utils/ui/DecalLayer";
import {ParticlePresetId, spawnParticle} from "./ParticlePresets";
import {DroppedItem, Item, ItemRarity} from "../core/Item";
import {Corpse} from "../objects/Corpse";
import BitmapFontIBMBIOS from "../../../assets/ibmbios";
import {types} from "sass";

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

function itemNameSpan(item:Item|null|undefined):Node|string {
	if (!item) return "-";
	let itemdesc = "";
	if (item.weapon) itemdesc += ` (${item.weapon.damage})`;
	if (item.armor) itemdesc += ` [${item.armor.defense}]`;
	return <span class={'text-rarity-'+ItemRarity[item.rarity].toLowerCase()}>{item.name}{itemdesc}</span>
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
	private sidebar: Element;

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
				{this.sidebar=<div class="sidestatus"></div>}
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

		let glyphFont = await BitmapFontIBMBIOS;

		// Setup canvas
		document.addEventListener("resize", ()=>{
			this.resizeCanvas();
		});

		// Create layers
		let tileLayerData:GlyphSource = {
			get width() { return GameState.mapWidth },
			get height() { return GameState.mapHeight },
			glyphAt(x: number, y: number){
				let i = GameState.level.xy2i(x,y);
				if (!GameState.vismap[i]) return null;
				let cell = GameState.level.cellAt({x,y});
				if (cell.objects.length > 0) return null;
				/*
				let d = GameState.approachPlayerMap[i];
				if (d >= 0 && d <= 9) {
					return {
						fg: '#777',
						ch: String(d),
						bg: '#333'
					}
				}
				 */
				return cell.tile;
			}
		};
		let mobjLayerData:GlyphSource = {
			get width() { return GameState.mapWidth },
			get height() { return GameState.mapHeight },
			glyphAt(x: number, y: number){
				let i = GameState.level.xy2i(x,y);
				if (!GameState.vismap[i]) return null;
				let cell  = GameState.level.cellAt({x,y});
				let mobj = cell.topMobj();
				let glyph = mobj?.glyph;
				if (glyph) glyph={...glyph};
				if (glyph && !glyph.bg) {
					glyph.bg = cell.tile.bg;
				}
				return glyph;
			}
		};
		/*
		let mouseX = -1, mouseY = -1;
		this.mainCanvas.element.addEventListener("mousemove",e=>{
			let cellxy = this.mainCanvas.unproject({
				x: e.offsetX,
				y: e.offsetY
			});
			mouseX = (cellxy.x/CELLWIDTH)|0;
			mouseY = (cellxy.y/CELLHEIGHT)|0;
		});
		 */
		let glyphLayer = new GlyphLayer("tiles", tileLayerData, glyphFont, CELLWIDTH, CELLHEIGHT);
		this.mainCanvas.addLayer(glyphLayer);
		this.decalLayer = new DecalLayer("decals");
		this.mainCanvas.addLayer(this.decalLayer);
		let mobjLayer = new GlyphLayer("mapObjects", mobjLayerData, glyphFont, CELLWIDTH, CELLHEIGHT);
		this.mainCanvas.addLayer(mobjLayer);
		this.particleLayer = new ParticleLayer("particles");
		this.particleLayer.particles.defaultAZ = -16*CELLHEIGHT;
		this.particleLayer.particles.defaultSize = 4;
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
		this.updateSidebar();
		this.frames++;
	}
	private updateSidebar() {
		removeChildren(this.sidebar);

		let player = GameState.player;

		this.sidebar.append(`Seed ${GameState.seed}\n`);
		this.sidebar.append(
			<span class={GameState.level.cleared?"text-blue":""}>Dungeon level {GameState.depth}</span>);
		this.sidebar.append(<br/>);
		this.sidebar.append(<br/>);
		this.sidebar.append(`Hero level ${player.level}\n`);
		this.sidebar.append("HP: ");
		for (let n = 1; n <= player.hpMax; n++) {
			if (player.hp >= n) this.sidebar.append(<span class="text-green">{Chars.SQUARE_WHITE}</span>);
			else this.sidebar.append(<span class="text-red">{Chars.SQUARE_BLACK}</span>)
			if (n%10 === 0 && n < player.hpMax) this.sidebar.append("\n    ");
		}
		this.sidebar.append('\n');
		this.sidebar.append(`Aim   : ${String(player.aim).padStart(3,' ')}%\n`);
		this.sidebar.append(`Dodge : ${String(player.dodge).padStart(3,' ')}%\n`);
		this.sidebar.append(`Damage: ${String(player.damage).padStart(3,' ')}\n`);

		this.sidebar.append("\n");
		this.sidebar.append("Weapon: ");
		this.sidebar.append(itemNameSpan(player.weapon))
		this.sidebar.append("\n");
		this.sidebar.append("Armor : ");
		this.sidebar.append(itemNameSpan(player.armor))
		this.sidebar.append("\n");

		this.sidebar.append("\n");
		for (let i of player.inventory) {
			this.sidebar.append(itemNameSpan(i));
			this.sidebar.append("\n");
		}
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
		if (!player.isAlive) {
			status += "{red;GAME OVER}  "
		} else {
			let yousee = player.cell.objects.filter(o => o !== player).map(mobj => this.formatTag(mobj, "")).join(", ");
			if (yousee) {
				status += `You see ${yousee}.`;
			}
		}
		status += " FPS: ";
		status += String(this.fps|0).padStart(2,' ');

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
		} else if (obj instanceof DroppedItem) {
			return this.formatTag(obj.item, key);
		} else if (obj instanceof Item) {
			switch (key) {
				case "":
					return `{rarity-${ItemRarity[obj.rarity].toLowerCase()};${obj.name}}`;
			}
		} else if (obj instanceof Corpse) {
			switch (key) {
				case "":
					return obj.name;
			}
		}
		return `{error;Unknown tag ${objectClassName(obj)}.${key}}`
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
