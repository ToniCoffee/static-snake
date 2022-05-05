import { getRandomInt } from '/src/utils/math-utils';

export function getStyle(element, property, asInt = true) {
	if(asInt) return parseInt(getComputedStyle(element).getPropertyValue(property));
	else return parseFloat(getComputedStyle(element).getPropertyValue(property));
}

export function removeChilds(element) {
	while(element.hasChildNodes()) {
		element.removeChild(element.lastChild);
	}
}

export function randomColor(withAlpha = false) {
	const colors = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
	let	color = '#';
	if(!withAlpha) for (let i = 0; i < 6; i++) color += colors[getRandomInt(0, 16)];
	else for (let i = 0; i < 8; i++) color += colors[getRandomInt(0, 16)];
	return color;
}

export function isMobileDevice() {
	return window.matchMedia('only screen and (max-width: 760px)').matches;
}

export function onMobileDoubleClick(e, callBack = () => {}, lastClickTime = 0, timeBetweenTaps = 200) {
	let time = new Date().getTime();
	if (time - lastClickTime < timeBetweenTaps) callBack(e);
	return time;
}