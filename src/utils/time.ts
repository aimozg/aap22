/*
 * Created by aimozg on 30.07.2022.
 */

const t0 = new Date().getTime();
export function milliTime():number {
	return new Date().getTime() - t0;
}
