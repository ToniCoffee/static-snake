// import { getStyle } from '/src/utils/common-utils';
import { clampFromZeroTo } from '/src/utils/math-utils';

import '/src/styles.css';

const TILE_SIZE = 20;
const DEVICE_WIDTH = window.innerWidth || window.screen.width;
const DEVICE_HEIGHT = window.innerHeight || window.screen.height;
const ROWS = Math.floor(DEVICE_HEIGHT / TILE_SIZE);
const COLUMNS = Math.floor(DEVICE_WIDTH / TILE_SIZE);
const MAP = {
	data: [],
	snakeCell: (row, column, color) => {
		MAP.data[row][column] = 1;
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.backgroundColor = color;
	},
	appleCell: (row, column) => {
		MAP.data[row][column] = 2;
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.backgroundColor = '#f00';
	},
	clearCell: (row, column) => {
		MAP.data[row][column] = 0;
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.backgroundColor = '#fff';
	},
};

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
	appleColor: '#f00',
};

const WRAPPER = document.querySelector('.wrapper');
WRAPPER.style.display = 'flex';
WRAPPER.style.flexWrap = 'wrap';
WRAPPER.style.flexDirection = 'column';
WRAPPER.style.width = `${COLUMNS * TILE_SIZE}px`;
WRAPPER.style.height = `${ROWS * TILE_SIZE}px`;
WRAPPER.style.position = 'absolute';
WRAPPER.style.top = '50%';
WRAPPER.style.left = '50%';
WRAPPER.style.transform = 'translate(-50%, -50%)';

let pause = false;
let direction = 0;
let initialTime = 0;
let currentTime = 0;
// let deltaTime = 0;
let fps = 10;
let fpsInterval = 1000 / fps;

function Point(x = 0, y = 0) {
	this.x = x;
	this.y = y;
	this.setPos = (x, y) => {
		this.x = x;
		this.y = y;
		this.x = clampFromZeroTo(this.x, COLUMNS - 1);
		this.y = clampFromZeroTo(this.y, ROWS - 1);
	};
}

function Snake(x = 0, y = 0) {
	this.childs = [new Point(x, y)];
	this.lastPos = new Point(this.childs[0].x, this.childs[0].y);
	this.lastChildPos = new Point(this.childs[0].x, this.childs[0].y);
	this.setPos = (obj, x, y) =>{
		obj.x = x;
		obj.y = y;
	};
	this.move = (child, x, y, index) => {
		if (index === 0) {
			MAP.clearCell(child.x, child.y);
			child.setPos(child.x + x, child.y + y);
			MAP.snakeCell(child.x, child.y, COLOR_MAP.snakeColor);
		} else {
			this.setPos(this.lastChildPos, child.x, child.y);
			MAP.clearCell(this.lastChildPos.x, this.lastChildPos.y);
			child.setPos(this.lastPos.x, this.lastPos.y);
			MAP.snakeCell(this.lastPos.x, this.lastPos.y, COLOR_MAP.snakeColor);
			this.setPos(this.lastPos, this.lastChildPos.x, this.lastChildPos.y);
		}
	};
	this.update = () => {
		this.setPos(this.lastPos, this.childs[0].x, this.childs[0].y);

		this.childs.forEach((child, index) => {
			if(direction === 1) this.move(child, 1, 0, index);
			else if(direction === -1) this.move(child, -1, 0, index);
			else if(direction === 2) this.move(child, 0, 1, index);
			else if(direction === -2) this.move(child, 0, -1, index);
		});
	};
}

const snake = new Snake(6, 16);
const apple = new Point(9, 3);

const KEYBOARD = {
	key: null,
	subscribers: [],
	add: (obj) => KEYBOARD.subscribers.push(obj),
	notify: (key) => {
		KEYBOARD.subscribers.map(() => console.log(`notify: ${key}`));
	}
};

const ON_DIRECTION = {
	'1': () => { // move right
		MAP.clearCell(snake.x, snake.y);
		snake.setPos(snake.x + 1, snake.y);
		MAP.snakeCell(snake.x, snake.y, COLOR_MAP.snakeColor);
	},
	'-1': () => { // move left
		MAP.clearCell(snake.x, snake.y);
		snake.setPos(snake.x - 1, snake.y);
		MAP.snakeCell(snake.x, snake.y, COLOR_MAP.snakeColor);
	},
	'2': () => { // move down
		MAP.clearCell(snake.x, snake.y);
		snake.setPos(snake.x, snake.y + 1);
		MAP.snakeCell(snake.x, snake.y, COLOR_MAP.snakeColor);
	},
	'-2': () => { // move up
		MAP.clearCell(snake.x, snake.y);
		snake.setPos(snake.x, snake.y - 1);
		MAP.snakeCell(snake.x, snake.y, COLOR_MAP.snakeColor);
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
	for (let column = 0; column < COLUMNS; column++) {
		MAP.data.push([]);
		for (let row = 0; row < ROWS; row++) {
			const cell = document.createElement('div');
			cell.id = `${column}_${row}`;
			cell.style.backgroundColor = `${COLOR_MAP.cellColor}`;
			cell.style.border = `1px solid ${COLOR_MAP.cellBorderColor}`;
			cell.style.width = `${TILE_SIZE}px`;
			cell.style.height = `${TILE_SIZE}px`;
			WRAPPER.appendChild(cell);
			MAP.data[column][row] = 0;
		} 
	}
}

/* function updateCell(row, column, value, color) {
	MAP[row][column] = value;
	snakePos.x = column; 
	snakePos.y = row; 
	const cell = document.getElementById(`${row}_${column}`);
	// KEYBOARD.add(cell);
	cell.style.backgroundColor = color;
} */

function setDirection(key) {
	if(DIRECTION_MAP[key]) direction = DIRECTION_MAP[key];
}

/* function resetDirection() {
	direction = 0;
}

function setCell(color) {
	updateCell(snakePos.y, snakePos.x, 1, color);
}

function resetCell() {
	updateCell(snakePos.y, snakePos.x, 0, COLOR_MAP.cellColor);
} */

function setPause(key) {
	if(key === PAUSE_MAP.key) pause = !pause;
}

function listeners() {
	document.addEventListener('keydown', e => {
		setDirection(e.code);
		setPause(e.code);
		// KEYBOARD.key = e.code;
		// KEYBOARD.notify(KEYBOARD.key);

		if(e.code === 'KeyU') console.log(direction);
	});

	/* document.addEventListener('keyup', () => {
		resetDirection();
	}); */
}

function onGetApple() {
	return (snake.x === apple.x && snake.y === apple.y);
}

function update() {
	// ON_DIRECTION[direction]();
	/* if(onGetApple()) {

	} */

	snake.update();
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
	// snake.setPos(6, 16);
	// apple.setPos(9, 6);
	// updateCell(16, 6, 1, COLOR_MAP.snakeColor);
	// MAP.snakeCell(snake.x, snake.y, COLOR_MAP.snakeColor);
	// MAP.appleCell(apple.x, apple.y);
	snake.update();
	initialTime = Date.now();
	requestAnimationFrame(gameLoop);
}

start();