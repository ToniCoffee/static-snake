export function getStyle(element, property, asInt = true) {
	if(asInt) return parseInt(getComputedStyle(element).getPropertyValue(property));
	else return parseFloat(getComputedStyle(element).getPropertyValue(property));
}