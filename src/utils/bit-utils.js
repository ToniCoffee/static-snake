export function checkBit(valueToCheck, bitPosition = 0) {
	return (valueToCheck & (1 << bitPosition)) !== 0;
}

export function setBit(valueToSet, bitPosition = 0) {
	return (valueToSet |= (1 << bitPosition));
}

export function clearBit(valueToSet, bitPosition = 0) {
	return (valueToSet &= ~(1 << bitPosition));
}

export function clearBits(valueToSet, bitsPosition = []) {
	bitsPosition.forEach(bit => {
		valueToSet &= ~(1 << bit);
	});
	return valueToSet;
}

export function switchBit(valueToSwitch, bitPosition = 0) {
	return (valueToSwitch ^= (1 << bitPosition));
}