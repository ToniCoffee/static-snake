import { getRandomInt } from '/src/utils/math-utils';

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

		if(this.x >= COLUMNS) this.x = 0;
		else if(this.x < 0) this.x = COLUMNS - 1;

		if(this.y >= ROWS) this.y = 0;
		else if(this.y < 0) this.y = ROWS - 1;
	};
}

function Snake(x = 0, y = 0) {
	this.childs = [new Point(x, y)];
	this.lastPos = new Point(this.childs[0].x, this.childs[0].y);
	this.lastChildPos = new Point(this.childs[0].x, this.childs[0].y);
	this.direction = 0;
	this.setPos = (obj, x, y) =>{
		obj.x = x;
		obj.y = y;
	};
	/* this.move = (child, x, y, index) => {
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
	}; */
	this.move = (child, x, y, index) => {
		if (index === 0) {
			child.setPos(child.x + x, child.y + y);
		} else {
			this.setPos(this.lastChildPos, child.x, child.y);
			child.setPos(this.lastPos.x, this.lastPos.y);
			this.setPos(this.lastPos, this.lastChildPos.x, this.lastChildPos.y);
		}
	};
	/* this.move = (child, x, y) => {
		// this.childs[0].x += x;
		// this.childs[0].y += y;
		// console.log({x: this.childs[0].x, y: this.childs[0].y});
		this.setPos(this.lastChildPos, this.lastPos.x, this.lastPos.y);
		child.setPos(this.lastPos.x, this.lastPos.y);
		this.setPos(this.lastPos, this.lastChildPos.x, this.lastChildPos.y);
	}; */
	this.update = () => {
		this.setPos(this.lastPos, this.childs[0].x, this.childs[0].y);

		this.childs.forEach((child, index) => {
			if(this.direction === 1) this.move(child, 1, 0, index);
			else if(this.direction === -1) this.move(child, -1, 0, index);
			else if(this.direction === 2) this.move(child, 0, 1, index);
			else if(this.direction === -2) this.move(child, 0, -1, index);
		});
	};
	this.render = () => {
		MAP.snakeCell(this.lastPos.x, this.lastPos.y, COLOR_MAP.snakeColor);
	};
}

function Apple(x = 0, y = 0) {
	this.pos = new Point(x, y);
	this.setPos = (x, y) =>{
		this.pos.x = x;
		this.pos.y = y;
	};
	this.render = () => {
		MAP.clearCell(this.pos.x, this.pos.y);
		MAP.appleCell(this.pos.x, this.pos.y, COLOR_MAP.appleColor);
	};
	this.update = () => {};
}

const snake = new Snake(6, 16);
const apple = new Apple(9, 3);

const KEYBOARD = {
	key: null,
	subscribers: [],
	add: (obj) => KEYBOARD.subscribers.push(obj),
	notify: (key) => {
		KEYBOARD.subscribers.map(() => console.log(`notify: ${key}`));
	}
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

function preventSnakeToMoveInOppositeDirection(direction) {
	if(direction * -1 !== snake.direction) snake.direction = direction;
}

function setDirection(key) {
	if(DIRECTION_MAP[key]) {
		direction = DIRECTION_MAP[key];
		preventSnakeToMoveInOppositeDirection(direction);
	}
}

function setPause(key) {
	if(key === PAUSE_MAP.key) pause = !pause;
}

let isKeyDown = false;
let keyDown = null;

function listeners() {
	document.addEventListener('keydown', e => {
		setPause(e.code);
		isKeyDown = true;
		keyDown = e.code;
	});

	document.addEventListener('keyup', () => {
		isKeyDown = false;
		keyDown = null;
	});
}

function onGetApple() {
	return (snake.childs[0].x === apple.pos.x && snake.childs[0].y === apple.pos.y);
}

function update() {
	
	if(isKeyDown) {
		setDirection(keyDown);
	}

	/* snake.update();

	if(onGetApple()) {
		let newApplePosX = getRandomInt(0, COLUMNS);
		let newApplePosY = getRandomInt(0, ROWS);
		apple.setPos(newApplePosX, newApplePosY);
		snake.childs.push(new Point(snake.lastPos.x, snake.lastPos.y));
	}
	
	apple.render(); */

	snake.setPos(snake.lastPos, snake.childs[0].x, snake.childs[0].y);

	snake.childs.forEach((child, index) => {
		MAP.clearCell(child.x, child.y);
		if(snake.direction === 1) snake.move(child, 1, 0, index);
		else if(snake.direction === -1) snake.move(child, -1, 0, index);
		else if(snake.direction === 2) snake.move(child, 0, 1, index);
		else if(snake.direction === -2) snake.move(child, 0, -1, index);
	});

	if(onGetApple()) {
		let newApplePosX = getRandomInt(0, COLUMNS);
		let newApplePosY = getRandomInt(0, ROWS);
		apple.setPos(newApplePosX, newApplePosY);
		snake.childs.push(new Point(snake.lastPos.x, snake.lastPos.y));
	}
	
	// snake.render();

	snake.childs.forEach((child) => {
		MAP.snakeCell(child.x, child.y, COLOR_MAP.snakeColor);
	});

	apple.render();
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
}

function start() {
	listeners();
	createMap();
	snake.update();
	apple.render();
	initialTime = Date.now();
	requestAnimationFrame(gameLoop);
}

start();