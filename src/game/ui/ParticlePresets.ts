/*
 * Created by aimozg on 08.03.2023.
 */

import {Particle, ParticleDef} from "./ParticleLayer";
import {Colors} from "../../utils/ui/canvas";
import {Tile, Tiles} from "../core/Tile";
import {GameState} from "../GameState";
import {CELLHEIGHT, CELLWIDTH} from "./ScreenManager";
import {Game} from "../Game";

function particleTile(p:Particle):Tile {
	let x = (p.x/CELLWIDTH)|0;
	let y = (p.y/CELLHEIGHT)|0;
	return GameState.level.tileAt({x,y})
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
				size: Game.screenManager.particleLayer.defaultSize*2,
				az: Game.screenManager.particleLayer.defaultAZ/16,
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

export type ParticlePresetId = "blood"|"spark"|"bone";

export function spawnParticle(
	preset:ParticlePresetId, x:number, y:number, z:number, vx:number, vy: number, vz:number):ParticleDef {
	let fxrng = Game.fxrng,
	    particleLayer = Game.screenManager.particleLayer;

	let pd:ParticleDef = {
		x: (x+fxrng.nextFloat(0.25,0.75))*CELLWIDTH,
		y: (y+fxrng.nextFloat(0.75,1.25))*CELLHEIGHT,
		z: z*CELLHEIGHT,
		ttl: 100,
		vx: 4*CELLWIDTH*(fxrng.nextFloat(-0.75,0.75)+vx),
		vy: 4*CELLHEIGHT*(fxrng.nextFloat(-0.75,0.75)+vy),
		vz: 4*fxrng.nextFloat(2,0)*CELLHEIGHT,
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
			pd.az = particleLayer.defaultAZ/2;
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
			pd.az = particleLayer.defaultAZ/2;
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
	}
	return pd
}
