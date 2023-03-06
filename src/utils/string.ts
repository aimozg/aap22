/*
 * Created by aimozg on 05.03.2023.
 */

export function repeatString(s:string, n:number):string {
	let result = "";
	while (n > 0) {
		if (n%2 === 0) result += s;
		s += s;
		n >>= 1;
	}
	return result;
}
