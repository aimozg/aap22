/*
 * Created by aimozg on 17.07.2022.
 */

export function createElement<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	props?: Record<string,any>,
	content?: string|Node
):HTMLElementTagNameMap[K] {
	let e = document.createElement(tagName);
	if (props) {
		for (let [k, v] of Object.entries(props)) {
			if (k in e && typeof (e as any)[k] === "boolean") {
				(e as any)[k] = v;
			} else {
				e.setAttribute(k, String(v));
			}
		}
	}
	if (content) {
		e.append(content);
	}
	return e;
}

export function removeChildren(parent:Node|null|undefined):void {
	if (!parent) return;
	let c;
	while ((c = parent.firstChild)) parent.removeChild(c);
}

export function moveChildren(source:Node, dest:Node, insertAfter:Node|null=null):void {
	if (!source || !dest || source === dest) return;
	let c;
	if (insertAfter) {
		insertAfter = insertAfter.nextSibling;
		while ((c = source.firstChild)) dest.insertBefore(c, insertAfter);
	} else{
		while ((c = source.firstChild)) dest.appendChild(c);
	}
}

export interface ComputedBoxes {
	padding: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	margin: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	border: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	content: {
		width: number;
		height: number;
	};
	boxSizing: 'border-box'|'content-box'|string;
}
export function getComputedBoxes(e:Element):ComputedBoxes {
	const style = getComputedStyle(e);
	let cw = e.clientWidth, ch = e.clientHeight;
	let padding = {
		left: parseFloat(style.paddingLeft || "0"),
		right: parseFloat(style.paddingRight || "0"),
		top: parseFloat(style.paddingTop || "0"),
		bottom: parseFloat(style.paddingBottom || "0"),
	}
	let margin = {
		left: parseFloat(style.marginLeft || "0"),
		right: parseFloat(style.marginRight || "0"),
		top: parseFloat(style.marginTop || "0"),
		bottom: parseFloat(style.marginBottom || "0"),
	}
	let border = {
		left: parseFloat(style.borderLeftWidth || "0"),
		right: parseFloat(style.borderRightWidth || "0"),
		top: parseFloat(style.borderTopWidth || "0"),
		bottom: parseFloat(style.borderBottomWidth || "0"),
	}
	let boxSizing = style.boxSizing;
	return {
		padding,margin,border,boxSizing,
		content: {
			width: cw - padding.left - padding.right,
			height: ch - padding.top - padding.bottom
		}
	}
}
