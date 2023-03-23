/*
 * Created by aimozg on 05.03.2023.
 */
import {LayeredCanvas} from "../../utils/ui/LayeredCanvas";
import {GlyphLayer, GlyphSource} from "../../utils/ui/GlyphLayer";
import {removeChildren} from "../../utils/ui/dom";
import {substitutePattern} from "../../utils/string";
import {GameObject} from "../ecs/GameObject";
import jsx from "texsaur";
import {ParticleDef, ParticleLayer} from "../../utils/ui/ParticleLayer";
import {XY} from "../../utils/grid/geom";
import {DecalLayer} from "../../utils/ui/DecalLayer";
import {ParticlePresetId, spawnParticle} from "./ParticlePresets";
import {Game} from "../Game";
import {DefaultSidebar} from "./DefaultSidebar";
import {formatTag, richText} from "./utils";
import BitmapFontIBMVGA8x16Ex from "../../../assets/ibmvga8x";

// export let FONTFACE = "IBMBIOS";
// export let FONTSIZE = "32px";
// export let FONT = `${FONTSIZE} ${FONTFACE}`;
export let CELLWIDTH = 32;
export let CELLHEIGHT = 32;

export interface ISidebar {
	render(container:Element):void;
	handleKeyEvent(hk:string):boolean;
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
	private sidebarNode: Element;
	private sidebar: ISidebar = new DefaultSidebar();

	afterLoad() {
		this.particleLayer.clear();
		this.clearLog();
	}

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
				{this.sidebarNode=<div class="sidestatus"></div>}
			</div>
			<div></div>
		</main>);

		// Load assets
		/*if (!document.fonts.check(FONT)) {
			for (let font of document.fonts.values()) {
				if (font.family === FONTFACE) {
					await font.load();
				}
			}
			/!*
			await new Promise<void>((resolve)=>{
				document.fonts.addEventListener("loadingdone", ()=>{
					if (document.fonts.check(FONT)) resolve();
				})
			});
			 *!/
		}*/

		let glyphFont = await BitmapFontIBMVGA8x16Ex;

		// Setup canvas
		document.addEventListener("resize", ()=>{
			this.resizeCanvas();
		});

		// Create layers
		let tileLayerData:GlyphSource = {
			get width() { return Game.state.mapWidth },
			get height() { return Game.state.mapHeight },
			glyphAt(x: number, y: number){
				let i = Game.state.level.xy2i(x,y);
				if (!Game.state.vismap[i]) return null;
				let cell = Game.state.level.cellAt({x,y});
				if (cell.objects.length > 0) return {
					ch: '',
					fg: '',
					bg: cell.tile.bg
				};
				/*
				let d = Game.state.approachPlayerMap[i];
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
			get width() { return Game.state.mapWidth },
			get height() { return Game.state.mapHeight },
			glyphAt(x: number, y: number){
				let i = Game.state.level.xy2i(x,y);
				if (!Game.state.vismap[i]) return null;
				let cell  = Game.state.level.cellAt({x,y});
				let mobj = cell.topMobj();
				let glyph = mobj?.glyph;
				if (glyph) glyph={...glyph};
				/*
				if (glyph && !glyph.bg) {
					glyph.bg = cell.tile.bg;
				}
				 */
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
		this.particleLayer.particles.maxz = CELLHEIGHT*2;
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
			x2: CELLWIDTH*Game.state.level.width,
			y1: 0,
			y2: CELLHEIGHT*Game.state.level.height
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
			x: (Game.state.player.pos.x+0.5)*CELLWIDTH,
			y: (Game.state.player.pos.y+0.5)*CELLHEIGHT
		})
		this.particleLayer.update(dt);
		this.mainCanvas.render();
		this.updateSidebar();
		this.frames++;
	}
	private updateSidebar() {
		removeChildren(this.sidebarNode);
		this.sidebar.render(this.sidebarNode);
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
			direction.x/n, direction.y/n, 1))
	}

	getStatusLine():string {
		let player = Game.state.player;

		let status = "";
		if (!player.isAlive) {
			status += "{red;GAME OVER}  "
		}
		status += " FPS: ";
		status += String(this.fps|0).padStart(2,' ');

		return status;
	}

	logsub(message: string, substitutions: Record<string, string | GameObject | number>|[string|GameObject|number]) {
		message = substitutePattern(message, str=>{
			if (str.includes(';')) return undefined;
			let parts = str.split('.');
			let objname = parts[0];
			let propname = parts[1] ?? "";
			let object = (substitutions as any)[objname];
			if (!object) return undefined;
			if (object instanceof GameObject) return formatTag(object, propname);
			if (typeof object === "number") {
				// TODO use propname to format the number
				return String(object);
			}
			return String(object);
		});
		this.log(message);
	}
	clearLog() {
		this.topLog.innerHTML = "";
		this.logLength = 0;
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
	handleKeyboard(hk:string):boolean {
		return this.sidebar.handleKeyEvent(hk);
	}
}
