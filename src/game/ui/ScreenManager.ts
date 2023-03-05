/*
 * Created by aimozg on 05.03.2023.
 */
import {LayeredCanvas} from "../../utils/ui/LayeredCanvas";
import {GlyphLayer, GlyphSource} from "./GlyphLayer";
import {GameState} from "../GameState";

export let FONTFACE = "IBMVGA8";
export let FONTSIZE = "32px";
export let FONT = `${FONTSIZE} ${FONTFACE}`;
export let CELLWIDTH = 16;
export let CELLHEIGHT = 32;

export class ScreenManager {

	constructor(readonly root:HTMLElement) {}

	mainCanvas:LayeredCanvas;

	async setup() {
		this.mainCanvas = new LayeredCanvas({
			fill: '#222',
			dragPan: false,
			wheelZoom: false
		});
		this.root.append(this.mainCanvas.element);

		// Load assets
		if (!document.fonts.check(FONT)) {
			await new Promise<void>((resolve)=>{
				document.fonts.addEventListener("loadingdone", ()=>{
					if (document.fonts.check(FONT)) resolve();
				})
			})
		}

		// Create layers
		let mobjLayerData:GlyphSource = {
			get width() { return GameState.mapWidth },
			get height() { return GameState.mapHeight },
			glyphAt(x: number, y: number){
				let level = GameState.level;
				let mobj = level.objectsAt({x, y}).maxOn("z");
				return mobj?.glyph ?? level.tileAt({x,y});
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
		this.mainCanvas.render();
	}
}
