// import { getStyle } from '/src/utils/common-utils';
import { clampFromZeroTo } from '/src/utils/math-utils';

import '/src/styles.css';

const TILE_SIZE = 20;
const DEVICE_WIDTH = window.innerWidth || window.screen.width;
const DEVICE_HEIGHT = window.innerHeight || window.screen.height;
const ROWS = Math.floor(DEVICE_HEIGHT / TILE_SIZE);
const COLUMNS = Math.floor(DEVICE_WIDTH / TILE_SIZE);
const MAP = [];

console.log(COLUMNS);
console.log(ROWS);

const DIRECTION_MAP = {
	KeyD: 1, // right
	KeyA: -1, // left
	KeyS: 2,	// down
	KeyW: -2, // up
	null: () => {},
	undefined: () => {}
};

const PAUSE_MAP = {
	key: 'KeyP'
};

const COLOR_MAP = {
	noColor: 'unset',
	cellColor: '#fff',
	cellBorderColor: '#333',
	snakeColor: '#0f0',
	appleColor: 'f00',
};

const WRAPPER = document.querySelector('.wrapper');
WRAPPER.style.display = 'flex';
WRAPPER.style.flexWrap = 'wrap';
WRAPPER.style.width = `${COLUMNS * TILE_SIZE}px`;
WRAPPER.style.height = `${ROWS * TILE_SIZE}px`;
WRAPPER.style.position = 'absolute';
WRAPPER.style.top = '50%';
WRAPPER.style.left = '50%';
WRAPPER.style.transform = 'translate(-50%, -50%)';

let pause = false;
let snakePosition = {x: 0, y: 0};
let direction = 0;
let initialTime = 0;
let currentTime = 0;
// let deltaTime = 0;
let fps = 10;
let fpsInterval = 1000 / fps;

const ON_DIRECTION = {
	'1': () => { // move right
		resetCell();
		snakePosition.x += 1;
		snakePosition.x = clampFromZeroTo(snakePosition.x, COLUMNS - 1);
		setCell(COLOR_MAP.snakeColor);
	},
	'-1': () => { // move left
		resetCell();
		snakePosition.x -= 1;
		snakePosition.x = clampFromZeroTo(snakePosition.x, COLUMNS - 1);
		setCell(COLOR_MAP.snakeColor);
	},
	'2': () => { // move down
		resetCell();
		snakePosition.y += 1;
		snakePosition.y = clampFromZeroTo(snakePosition.y, ROWS - 1);
		setCell(COLOR_MAP.snakeColor);
	},
	'-2': () => { // move up
		resetCell();
		snakePosition.y -= 1;
		snakePosition.y = clampFromZeroTo(snakePosition.y, ROWS - 1);
		setCell(COLOR_MAP.snakeColor);
	},
	'0': () => {}, // don't move
	null: () => {},
	undefined: () => {}
};

let requestAnimationFrame = window.requestAnimationFrame || 
														window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || 
														window.msRequestAnimationFrame;

let cancelAnimationFrame = 	window.cancelAnimationFrame || 
														window.mozCancelAnimationFrame;

function createMap() {
	for (let row = 0; row < ROWS; row++) {
		MAP.push([]);
		for (let column = 0; column < COLUMNS; column++) {
			const cell = document.createElement('div');
			cell.id = `${row}_${column}`;
			cell.style.backgroundColor = `${COLOR_MAP.cellColor}`;
			cell.style.border = `1px solid ${COLOR_MAP.cellBorderColor}`;
			cell.style.width = `${TILE_SIZE}px`;
			cell.style.height = `${TILE_SIZE}px`;
			WRAPPER.appendChild(cell);
			MAP[row][column] = 0;
		} 
	}
}

function updateCell(row, column, value, color) {
	MAP[row][column] = value;
	snakePosition.x = column; 
	snakePosition.y = row; 
	const cell = document.getElementById(`${row}_${column}`);
	cell.style.backgroundColor = color;
}

function setDirection(key) {
	direction = DIRECTION_MAP[key];
}

function resetDirection() {
	direction = 0;
}

function setCell(color) {
	updateCell(snakePosition.y, snakePosition.x, 1, color);
}

function resetCell() {
	updateCell(snakePosition.y, snakePosition.x, 0, COLOR_MAP.cellColor);
}

function setPause(key) {
	if(key === PAUSE_MAP.key) pause = !pause;
}

function listeners() {
	document.addEventListener('keydown', e => {
		setDirection(e.code);
		setPause(e.code);
	});

	document.addEventListener('keyup', () => {
		resetDirection();
	});
}

function update() {
	ON_DIRECTION[direction]();
}

const ON_PAUSE = {
	false: () => {
		currentTime = Date.now();
		let interval = currentTime - initialTime;

		if(interval >= fpsInterval) {
			// initialTime = currentTime;
			initialTime = currentTime - (interval % fpsInterval);
			update();
		}
	},
	true: () => {}
};

function gameLoop() {
	requestAnimationFrame(gameLoop);
	ON_PAUSE[pause]();
	
	/* if(!pause) {
		currentTime = Date.now();
		let interval = currentTime - initialTime;

		if(interval >= fpsInterval) {
			// initialTime = currentTime;
			initialTime = currentTime - (interval % fpsInterval);
			update();
		} 
	}*/
}

function start() {
	listeners();
	createMap();
	updateCell(16, 6, 1, COLOR_MAP.snakeColor);
	initialTime = Date.now();
	requestAnimationFrame(gameLoop);
}

start();