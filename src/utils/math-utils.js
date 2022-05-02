export function minBetween(a, b) {
	return (a + b - Math.abs(a - b)) / 2;
}

export function maxBetween(a, b) {
	return (a + b + Math.abs(a - b)) / 2;
}

export function min(a) {
	return (a - Math.abs(a)) / 2;
}

export function max(a) {
	return (a + Math.abs(a)) / 2;
}

export function clamp(value, min, max) {
	let temp = value + max - Math.abs(value - max);
	return (temp + (2.0 * min) + Math.abs(temp - (2.0 * min))) * 0.25;
}

export function clampFromZeroTo(value, max) {
	let temp = value + max - Math.abs(value - max);
	return (temp + Math.abs(temp)) * 0.25;
}

export function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}