/*
 * Created by aimozg on 08.03.2023.
 */

import {AbstractCanvasLayer} from "./LayeredCanvas";
import {RGBColor} from "./canvas";
import * as tinycolor from "tinycolor2";

export interface Particle {
	x: number;
	y: number;
	z: number;
	v: boolean;
	vx: number;
	vy: number;
	vz: number;
	az: number;
	ttl: number;
	size: number;
	color: string;
	onTick?: ((p:Particle)=>void);
	onDeath?: ((p:Particle)=>void);
}
export interface ParticleDef {
	x: number;
	y: number;
	z: number;
	vx?: number;
	vy?: number;
	vz?: number;
	az?: number;
	ttl?: number;
	size?: number;
	color: string|RGBColor;
	onTick?: (p:Particle)=>void;
	onDeath?: (p:Particle)=>void;
}

export class ParticleStore {
	particles: Particle[] = [];
	defaultAZ = 0;
	defaultSize = 2;
	clear() {
		this.particles = [];
	}
	addParticle(def:ParticleDef) {
		let p:Particle = {
			x: def.x,
			y: def.y,
			z: def.z,
			vx: def.vx ?? 0,
			vy: def.vy ?? 0,
			vz: def.vz ?? 0,
			v: true,
			az: def.az ?? this.defaultAZ,
			ttl: def.ttl ?? 1,
			size: def.size ?? this.defaultSize,
			color: tinycolor(def.color).toHex8String(),
			onTick: def.onTick,
			onDeath: def.onDeath,
		};
		p.x -= p.size/2;
		p.y -= p.size/2;
		if (p.vx === 0 && p.vy === 0 && p.vz === 0 && p.az === 0) p.v = false;
		this.particles.push(p);
	}

	update(dt: number) {
		let remove:number[] = [];
		for (let i = 0; i < this.particles.length; i++) {
			let p = this.particles[i];
			p.ttl -= dt;
			if (p.v) {
				p.x += p.vx * dt;
				p.y += p.vy * dt;
				p.z += p.vz * dt;
				if (p.z <= 0) {
					p.v = false;
					p.ttl = 0;
				}
				p.vz += p.az * dt;
			}
			p.onTick?.(p);
			if (p.ttl < 0) {
				p.onDeath?.(p);
				remove.push(i);
			}
		}
		for (let i = remove.length-1; i>=0; i--) {
			this.particles[remove[i]] = this.particles[this.particles.length-1];
			this.particles.pop();
		}
	}
}

export class ParticleLayer extends AbstractCanvasLayer {

	constructor(id: string) {
		super(id);
	}
	res = 0;
	particles = new ParticleStore()

	clear() {
		this.particles.clear();
	}
	addParticle(def:ParticleDef) {
		this.particles.addParticle(def);
	}
	update(dt: number) {
		this.particles.update(dt);
	}
	drawTo(dst: CanvasRenderingContext2D): void {
		let res      = this.res;
		for (let particle of this.particles.particles) {
			renderParticle(dst, particle, res);
		}
	}
}

export function renderParticle(
	dst: CanvasRenderingContext2D,
	particle: Particle,
	res: number) {
	dst.fillStyle = particle.color;
	let x         = particle.x;
	let y         = particle.y-particle.z;
	if (res) {
		x = (x/res|0)*res;
		y = (y/res|0)*res;
	}
	dst.fillRect(x,y,particle.size,particle.size);
}
