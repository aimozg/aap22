/*
 * Created by aimozg on 08.03.2023.
 */

import {Particle, ParticleDef} from "../../utils/ui/ParticleLayer";
import {Colors} from "../../utils/ui/canvas";
import {Tile, Tiles} from "../core/Tile";
import {CELLHEIGHT, CELLWIDTH} from "./ScreenManager";
import {Game} from "../Game";

function particleTile(p:Particle):Tile {
	let x = (p.x/CELLWIDTH)|0;
	let y = (p.y/CELLHEIGHT)|0;
	return Game.state.level.tileAt({x,y})
}
function hitWallDrop(p:Particle) {
	if (particleTile(p) === Tiles.wall) {
		p.vx = 0;
		p.vy = 0;
	}
}
function hitWallBounce(p:Particle) {
	if (particleTile(p) === Tiles.wall) {
		if (Game.fxrng.nextBoolean()) p.vx *= -1;
		else p.vy *= -1;
	}
}
function iterateColors(p:Particle, colors:string[], totalTtl:number) {
	let ttl = p.ttl/totalTtl, step = ttl/colors.length;
	for (let i = 0; i < colors.length; i++) {
		ttl -= step;
		if (ttl <= 0) {
			p.color = colors[i];
			return;
		}
	}
}
function toDecal(p:Particle, color:string, size:number) {
	switch (particleTile(p)) {
		case Tiles.lava:
			Game.screenManager.addParticle({
				x: p.x,
				y: p.y,
				z: 0.1,
				vz: Game.fxrng.nextFloat(1,2)*CELLHEIGHT,
				size: Game.screenManager.particleLayer.particles.defaultSize*2,
				az: Game.screenManager.particleLayer.particles.defaultAZ/16,
				ttl: 1,
				color: Colors.DARKGRAY
			});
			break;
		case Tiles.water:
			break;
		default:
			Game.screenManager.decalLayer.addDecal({
				x: (p.x/4|0)*4,
				y: (p.y/4|0)*4,
				color: color,
				size: size
			})
	}
}

export interface ParticlePreset {
	/** 0: left, 1: right */
	x0: number;
	/** starting pos spread, gaussian -xspread..+xspread */
	xspread: number;
	/** 0: top, 1: bottom */
	y0: number;
	/** starting pos spread, gaussian -yspread..+yspread */
	yspread: number;
	/** 0: floor, 1: ceiling */
	z0: number;
	/** starting pos spread, gaussian -zspread..+zspread */
	zspread: number;
	/** starting XY speed (cells/sec) */
	vxybase: number;
	/** starting XY speed spread, gaussian -vxyspread..+vxyspread */
	vxyspread: number;
	/** starting Z speed (cells/sec) */
	vzbase: number;
	/** starting Z speed spread, gaussian -vxyspread..+vxyspread */
	vzspread: number;
	/** gravity factor */
	g: number;
	/** time to live, seconds */
	ttl: number;
	/** ttl spread, gaussian -ttlspread..+ttlspread */
	ttlspread: number;
}

export let ParticlePresets = {
	"blood": {
		x0: 0.5,
		xspread: 0.25,
		y0: 1,
		yspread: 0.25,
		z0: 0.5,
		zspread: 0,
		vxybase: 4,
		vxyspread: 0.75,
		vzbase: 4,
		vzspread: 1,
		g: 1,
		ttl: 10,
		ttlspread: 0,
	},
	"spark": {
		x0: 0.5,
		xspread: 0.25,
		y0: 1,
		yspread: 0.25,
		z0: 0.5,
		zspread: 0,
		vxybase: 8,
		vxyspread: 0.75,
		vzbase: 2,
		vzspread: 1,
		g: 0.5,
		ttl: 1/3,
		ttlspread: 1/3
	},
	"bone": {
		x0: 0.5,
		xspread: 0.25,
		y0: 1,
		yspread: 0.25,
		z0: 0.5,
		zspread: 0,
		vxybase: 4,
		vxyspread: 0.75,
		vzbase: 1,
		vzspread: 1,
		g: 1,
		ttl: 1/8,
		ttlspread: 1/16,
	},
	"heal": {
		x0: 0.5,
		xspread: 0.5,
		y0: 1,
		yspread: 0.5,
		z0: 0.5,
		zspread: 0,
		vxybase: 0,
		vxyspread: 0,
		vzbase: 2,
		vzspread: 0.5,
		g: 0,
		ttl: 0.5,
		ttlspread: 0.1
	}
} satisfies Record<string,ParticlePreset>;

export type ParticlePresetId = "blood"|"spark"|"bone"|"heal";

export function spawnParticle(
	presetId:ParticlePresetId, x:number, y:number, z:number, vx:number, vy: number, vz:number):ParticleDef {
	let fxrng = Game.fxrng,
	    particles = Game.screenManager.particleLayer.particles;
	let preset = ParticlePresets[presetId];
	let pd:ParticleDef = {
		x: CELLWIDTH * fxrng.nextGaussian(preset.xspread, x + preset.x0, 3),
		y: CELLHEIGHT * fxrng.nextGaussian(preset.yspread, y + preset.y0, 3),
		z: CELLHEIGHT * fxrng.nextGaussian(preset.zspread, z + preset.z0, 3),
		ttl: fxrng.nextGaussian(preset.ttlspread, preset.ttl, 3),
		vx: CELLWIDTH * preset.vxybase * fxrng.nextGaussian(preset.vxyspread, vx, 3),
		vy: CELLHEIGHT * preset.vxybase * fxrng.nextGaussian(preset.vxyspread, vy, 3),
		vz: CELLHEIGHT * preset.vzbase * fxrng.nextGaussian(preset.vzspread, vz, 3),
		az: preset.g*particles.defaultAZ,
		color: "white"
	};
	// console.log('spawned ',pd);
	switch (presetId) {
		case "blood":
			pd.color = Colors.LIGHTRED;
			pd.onTick = p=>hitWallDrop(p);
			pd.onDeath = p=>toDecal(p, Colors.RED, 8);
			break;
		case "spark":
			pd.color = Colors.WHITE;
			let colors = [Colors.WHITE,Colors.LIGHTYELLOW,Colors.LIGHTORANGE,Colors.LIGHTRED];
			pd.onTick = (p)=>{
				hitWallBounce(p);
				iterateColors(p, colors, 1);
			}
			break;
		case "bone":
			pd.color = Colors.WHITE;
			pd.onTick = (p)=>{
				hitWallBounce(p);
			}
			// pd.onDeath = p=>toDecal(p, Colors.WHITE, 4);
			break;
		case "heal":
			pd.color = Colors.LIGHTGREEN;
			break;
	}
	return pd
}
