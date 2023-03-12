/*
 * Created by aimozg on 28.02.2023.
 */

import {createCanvas} from "./canvas";
import {coerce, logarithm} from "../math/utils";
import {XY, XYRect} from "../grid/geom";
import {getComputedBoxes} from "./dom";
import {LogManager} from "../logging/LogManager";
import {milliTime} from "../time";

// TODO move to utils
export type UIEventModifier = null | "shift" | "ctrl" | "alt";
export function eventHasMod(mod:UIEventModifier, e:MouseEvent|KeyboardEvent):boolean {
	let {ctrlKey,shiftKey,altKey} = e;
	switch (mod) {
		case null: return !ctrlKey && !shiftKey && !altKey;
		case "shift": return !ctrlKey && shiftKey && !altKey;
		case "ctrl": return ctrlKey && !shiftKey && !altKey;
		case "alt": return !ctrlKey && !shiftKey && altKey;
	}
	return false;
}

export interface LayeredCanvasOptions {
	viewportWidth: number;
	viewportHeight: number;

	zoom: number;
	minZoom: number;
	maxZoom: number;

	center: XY;

	wheelZoom: boolean;
	wheelZoomMod: UIEventModifier;
	dragPan: boolean;
	dragPanButton: number;
	dragPanMod: UIEventModifier;

	fill: string|null;
}

export abstract class AbstractCanvasLayer {
	protected constructor(
		public readonly id: string
	) {}

	visible:boolean = true;
	fixed:boolean = false;
	abstract drawTo(dst: CanvasRenderingContext2D, visibleRect:XYRect): void;
}

export class LayeredCanvas {
	constructor(options?:Partial<LayeredCanvasOptions>) {
		this.options = Object.assign({
			viewportWidth: 300,
			viewportHeight: 200,

			zoom: 0,
			minZoom: -20,
			maxZoom: +20,
			center: {x:0,y:0},

			wheelZoom: true,
			wheelZoomMod: null,
			dragPan: true,
			dragPanButton: 2, // right button
			dragPanMod: null,

			fill: null,
		}, options);
		this.zoomFactor = this.calcZoomFactor();

		this.c2d = createCanvas(this.options.viewportWidth, this.options.viewportHeight);
		this.updateViewport(this.options.viewportWidth, this.options.viewportHeight);
		this.setupEvents();
	}

	readonly c2d:CanvasRenderingContext2D;

	private options: LayeredCanvasOptions;
	get viewportWidth():number { return this.options.viewportWidth }
	get viewportHeight():number { return this.options.viewportHeight }
	get zoom():number { return this.options.zoom }
	private zoomFactor: number;
	get minZoom():number { return this.options.minZoom }
	get maxZoom():number { return this.options.maxZoom }
	get centerX():number { return this.options.center.x }
	get centerY():number { return this.options.center.y }

	private readonly layers: AbstractCanvasLayer[] = [];
	phase = 0;
	animationSpeed = 1;

	beforeRender: ((l:this) => void) | null = null;
	afterRender: ((l:this) => void) | null = null;

	get element():HTMLCanvasElement {
		return this.c2d.canvas;
	}

	private zoomConstant = 9 / 8;

	private calcZoomFactor():number {
		return this.zoomConstant**this.zoom;
	}
	private calcZoomFromFactor(zf:number):number {
		return logarithm(this.zoomConstant, zf);
	}
	addLayer(layer: AbstractCanvasLayer, below?:string): void {
		let pos = below ? this.layers.findIndex(layer=>layer.id === below) : -1;
		if (pos === -1) {
			this.layers.push(layer);
		} else {
			this.layers.splice(pos, 0, layer);
		}
	}
	addLayerAbove(layer: AbstractCanvasLayer, refLayerId:string):void {
		let pos = this.layers.findIndex(layer=>layer.id === refLayerId);
		if (pos === -1) {
			this.layers.unshift(layer);
		} else {
			this.layers.splice(pos+1, 0, layer);
		}
	}

	setViewport(width:number, height:number): boolean {
		if (this.options.viewportWidth === width && this.options.viewportHeight === height) return false;
		this.options.viewportWidth = width;
		this.options.viewportHeight = height;
		this.updateViewport(width, height);
		return true;
	}

	private updateViewport(width: number, height: number) {
		this.c2d.canvas.style.width = `${width}px`;
		this.c2d.canvas.style.height = `${height}px`;
		this.c2d.canvas.width = width * devicePixelRatio;
		this.c2d.canvas.height = height * devicePixelRatio;
	}

	stretchToParentSize(): boolean {
		if (!document.contains(this.c2d.canvas)) return false;
		let parent = this.c2d.canvas.parentElement;
		if (!parent) {
			logger.warn("stretchToParentSize() with no parent")
			return false;
		}
		let {width,height} = getComputedBoxes(parent).content;
		return this.setViewport(width, height);
	}

	setZoom(zoom:number): void {
		this.options.zoom = coerce(zoom, this.minZoom, this.maxZoom);
		this.zoomFactor = this.calcZoomFactor();
	}
	setZoomFactor(zf:number):void {
		this.setZoom(this.calcZoomFromFactor(zf));
	}
	modZoom(delta:number): void {
		this.setZoom(this.zoom + delta);
	}
	setCenter(center:XY): void {
		this.options.center = {x:center.x, y:center.y};
	}
	scrollBy(dx:number, dy: number):void {
		this.options.center.x += dx/this.zoomFactor;
		this.options.center.y += dy/this.zoomFactor;
	}
	visibleRect():XYRect {
		return XYRect.fromCenter(
			this.options.center,
			this.viewportWidth / this.zoomFactor,
			this.viewportHeight / this.zoomFactor
		)
	}
	isPointVisible(xy:XY):boolean {
		return this.visibleRect().includes(xy);
	}
	isRectVisible(rect:XYRect):boolean {
		let vr = this.visibleRect();
		return vr.includes(rect.topLeft) &&
			vr.includes(rect.bottomRight);
	}
	fitToShow(rect:XYRect, canZoomOut:boolean=true, canZoomIn:boolean=true):void {
		let scaleX = this.viewportWidth / rect.fwidth;
		let scaleY = this.viewportHeight / rect.fheight;
		let zf = Math.min(scaleX, scaleY);
		if (zf < this.zoomFactor && canZoomOut ||
			zf > this.zoomFactor && canZoomIn) {
			this.setZoomFactor(zf);
		}
		this.setCenter(rect.fcenter());
	}
	zoomOutToShow(rect:XYRect, padding:number = 0):void {
		if (padding) rect = rect.expand(padding);
		if (this.isRectVisible(rect)) return;
		this.fitToShow(rect, true, false);
	}

	render() {
		this.phase = this.animationSpeed * milliTime() / 1000;
		this.beforeRender?.(this);

		const c2d = this.c2d;
		c2d.imageSmoothingEnabled = false;
		c2d.save();
		c2d.scale(devicePixelRatio, devicePixelRatio)
		if (this.options.fill && this.options.fill !== "none") {
			c2d.fillStyle = this.options.fill;
			c2d.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
		}
		let fixedTransform = c2d.getTransform();
		c2d.translate(this.viewportWidth/2, this.viewportHeight/2);
		c2d.scale(this.zoomFactor, this.zoomFactor);
		c2d.translate(-this.centerX, -this.centerY);
		let mainTransform = c2d.getTransform();
		let visibleRect = this.visibleRect();
		for (let layer of this.layers) {
			if (!layer.visible) continue;
			if (layer.fixed) {
				c2d.setTransform(fixedTransform);
			}
			layer.drawTo(c2d, visibleRect);
			if (layer.fixed) {
				c2d.setTransform(mainTransform);
			}
		}

		this.afterRender?.(this);
		c2d.restore();
	}
	private setupEvents() {
		let element = this.element;
		if (this.options.wheelZoom) {
			element.addEventListener("wheel", (e)=>this.handleWheelEvent(e), { passive: false });
		}
		if (this.options.dragPan) {
			element.addEventListener("mousedown", (e)=> {
				if (e.button === this.options.dragPanButton) {
					e.preventDefault();
					this.panStart(e.screenX, e.screenY);
				}
			});
			element.addEventListener("mouseleave", (e)=> {
				this.panStop();
			});
			element.addEventListener("mouseup", (e)=> {
				if (e.button === this.options.dragPanButton) {
					e.preventDefault();
					this.panStop();
				}
			});
			element.addEventListener("mousemove", (e)=> {
				if (this.isPanning) {
					e.preventDefault();
					this.panMove(e.screenX, e.screenY);
				}
			});
			element.addEventListener("contextmenu",
				(e) => {
					if (this.wasDrag) e.preventDefault();
				}
			);
		}
		element.addEventListener("click", (e)=> {
			if (this.wasDrag) {
				e.preventDefault();
			}
		});
		element.addEventListener("touchstart", (e)=> {
			if (e.touches.length === 1) {
				e.preventDefault();
				this.panStart(e.touches[0].screenX, e.touches[0].screenY);
			} else if (e.touches.length === 2) {
				e.preventDefault();
				this.pinchZoomStart(
					e.touches[0].screenX,
					e.touches[0].screenY,
					e.touches[1].screenX,
					e.touches[1].screenY);
			} else {
				this.panStop();
			}
		}, {passive:false});
		element.addEventListener("touchend", (e) => {
			this.panStop();
			this.pinchZoomEnd();
		});
		element.addEventListener("touchmove", (e)=>{
			if (e.touches.length === 1 && this.isPanning) {
				e.preventDefault();
				this.panMove(e.touches[0].screenX, e.touches[0].screenY);
			} else if (e.touches.length === 2 && this.isPinchZooming) {
				e.preventDefault();
				this.pinchZoomMove(
					e.touches[0].screenX,
					e.touches[0].screenY,
					e.touches[1].screenX,
					e.touches[1].screenY);
			}
		}, {passive:false});
	}
	private mouseX = 0;
	private mouseY = 0;
	private isPanning = false;
	private wasDrag = false;
	private panMove(x: number, y: number) {
		this.wasDrag = true;
		let dx = this.mouseX - x;
		let dy = this.mouseY - y;
		this.scrollBy(dx, dy);
		this.mouseX = x;
		this.mouseY = y;
	}

	private panStop() {
		this.isPanning = false;
	}

	private panStart(x: number, y: number) {
		this.wasDrag = false;
		this.isPanning = true;
		this.mouseX = x;
		this.mouseY = y;
	}


	private handleWheelEvent(e:WheelEvent) {
		if (!eventHasMod(this.options.wheelZoomMod, e)) return;
		e.preventDefault();
		this.modZoom(e.deltaY < 0 ? +1 : -1);
	}

	private isPinchZooming = false;
	private pinchDistance = 0;
	private pinchZoomSpeed = 1/32;
	private pinchZoomStart(x1: number, y1: number, x2: number, y2: number) {
		// logger.debug("pinchZoomStart {} {} {} {}",x1,y1,x2,y2);
		this.isPinchZooming = true;
		this.pinchDistance = XY.distance({x:x1,y:y1}, {x:x2,y:y2});
	}

	private pinchZoomEnd() {
		this.isPinchZooming = false;
	}

	private pinchZoomMove(x1: number, y1: number, x2: number, y2: number) {
		// logger.debug("pinchZoomMove {} {} {} {}",x1,y1,x2,y2);
		let d2 = XY.distance({x:x1,y:y1}, {x:x2,y:y2});
		this.modZoom((d2-this.pinchDistance)*this.pinchZoomSpeed);
		this.pinchDistance = d2;
	}
}

const logger = LogManager.loggerFor("LayeredCanvas")
