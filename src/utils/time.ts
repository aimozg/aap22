/*
 * Created by aimozg on 30.07.2022.
 */

let performanceIsAvailable: boolean =
	    typeof performance === "object" && typeof performance.now === "function";

function milliTimePerformance():number {
	return performance.now();
}

const t0 = new Date().getTime();
function milliTimeDate():number {
	return new Date().getTime() - t0;
}
export const milliTime: ()=>number = performanceIsAvailable ? milliTimePerformance : milliTimeDate;
