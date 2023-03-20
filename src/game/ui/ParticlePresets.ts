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

export type ParticlePresetId = "blood"|"spark"|"bone"|"heal";

export function spawnParticle(
	preset:ParticlePresetId, x:number, y:number, z:number, vx:number, vy: number, vz:number):ParticleDef {
	let fxrng = Game.fxrng,
	    particles = Game.screenManager.particleLayer.particles;

	let xspread = 0.25, yspread = 0.25,
	    vxspread = 0.75, vyspread = 0.75, vzspread = 1,
	    vbase = 4, vzbase = 4, ttl = 100, g = 1
	;
	if (preset === "heal") {
		xspread = 0.5;
		yspread = 0.5;
		vxspread = 0;
		vyspread = 0;
		vzbase = 2;
		vzspread = 0.5;
		g = 0;
		ttl = 0.5;
	}
	let pd:ParticleDef = {
		x: (x+0.5+fxrng.nextFloat(-xspread,xspread))*CELLWIDTH,
		y: (y+1.0+fxrng.nextFloat(-yspread,yspread))*CELLHEIGHT,
		z: z*CELLHEIGHT,
		ttl: ttl,
		vx: vbase*CELLWIDTH*(fxrng.nextFloat(-vxspread,vxspread)+vx),
		vy: vbase*CELLHEIGHT*(fxrng.nextFloat(-vxspread,vyspread)+vy),
		vz: vzbase*CELLHEIGHT*(fxrng.nextFloat(-vzspread,vzspread)+vz),
		az: g*particles.defaultAZ,
		color: "white"
	};
	switch (preset) {
		case "blood":
			pd.ttl = 10;
			pd.color = Colors.LIGHTRED;
			pd.onTick = p=>hitWallDrop(p);
			pd.onDeath = p=>toDecal(p, Colors.RED, 8);
			break;
		case "spark":
			pd.color = Colors.WHITE;
			pd.az = particles.defaultAZ/2;
			pd.ttl = fxrng.nextFloat(0.25,1.0);
			pd.vx! *= 2;
			pd.vy! *= 2;
			pd.vz! *= 0.5;
			let colors = [Colors.WHITE,Colors.LIGHTYELLOW,Colors.LIGHTORANGE,Colors.LIGHTRED];
			pd.onTick = (p)=>{
				hitWallBounce(p);
				iterateColors(p, colors, 1);
			}
			break;
		case "bone":
			pd.color = Colors.WHITE;
			pd.az = particles.defaultAZ/2;
			pd.ttl = fxrng.nextFloat(0.125,0.25);
			// pd.size = particleLayer.defaultSize*2;
			// pd.vx! *= 2;
			// pd.vy! *= 2;
			pd.vz! *= 0.25;
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
