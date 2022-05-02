import { randomColor } from '/src/utils/common-utils';
import { getRandomInt } from '/src/utils/math-utils';
import { checkBit, setBit, clearBit, clearBits, switchBit } from '/src/utils/bit-utils';

import '/src/styles.css';

const TILE_SIZE = 20;
const DEVICE_WIDTH = window.innerWidth || window.screen.width;
const DEVICE_HEIGHT = window.innerHeight || window.screen.height;
const ROWS = Math.floor(DEVICE_HEIGHT / TILE_SIZE);
const COLUMNS = Math.floor(DEVICE_WIDTH / TILE_SIZE);

const COLOR_MAP = {
	noColor: 'unset',
	classic: {
		backgroundColor: '#000',
		cellColor: '#000',
		cellBorderColor: '#000',
		snakeColor: '#0f0',
		appleColor: '#f00',
		clearColor: '#000',
		borderRadius: '0px',
		boxShadow: 'none',
		isClassic: true
	},
	theme_1: {
		backgroundColor: '#030',
		cellColor: '#770',
		cellBorderColor: '#770',
		snakeColor: '#0f0',
		appleColor: '#f00',
		clearColor: '#770',
		borderRadius: '7px',
		boxShadow: '0px 0px 5px #fff',
		random: `${randomColor()}`,
		isClassic: false
	},
};

const CURRENT_COLOR_MAP = COLOR_MAP.theme_1;

const MAP = {
	data: [],
	clearCell: (row, column) => {
		// MAP.data[row][column] = 0;
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.backgroundColor = `${CURRENT_COLOR_MAP.clearColor}`;
		cell.style.borderColor = `${CURRENT_COLOR_MAP.clearColor}`;
		cell.style.boxShadow = 'none';
		// cell.style.backgroundColor = 'none';
		// cell.style.borderColor = 'none';
		return cell;
	},
};

console.log(COLUMNS);
console.log(ROWS);

let GAME_STATE = 0x03;

/* GAME_STATE = { // 0000_0000_0000_0011
	// bit 1 --> alive / dead;
	// bit 2 --> paused / running;
	// bit 3 --> moving right;
	// bit 4 --> moving left;
	// bit 5 --> moving down;
	// bit 6 --> moving up;
}; */

const DIRECTION_MAP = {
	KeyD: () => {
		if(!checkBit(GAME_STATE, 3)) {
			GAME_STATE = clearBits(GAME_STATE, [3, 4, 5]);
			GAME_STATE = setBit(GAME_STATE, 2);
		}
	}, // right
	KeyA: () => {
		if(!checkBit(GAME_STATE, 2)) {
			GAME_STATE = clearBits(GAME_STATE, [2, 4, 5]);
			GAME_STATE = setBit(GAME_STATE, 3);
		}
	}, // left
	KeyS: () => {
		if(!checkBit(GAME_STATE, 5)) {
			GAME_STATE = clearBits(GAME_STATE, [2, 3, 5]);
			GAME_STATE = setBit(GAME_STATE, 4);
		}
	},	// down
	KeyW: () => {
		if(!checkBit(GAME_STATE, 4)) {
			GAME_STATE = clearBits(GAME_STATE, [2, 3, 4]);
			GAME_STATE = setBit(GAME_STATE, 5);
		}
	}, // up
	null: () => {},
	undefined: () => {} 
};

const PAUSE_MAP = {
	key: 'KeyP'
};

const WRAPPER = document.querySelector('.wrapper');
WRAPPER.style.width = `${COLUMNS * TILE_SIZE}px`;
WRAPPER.style.height = `${ROWS * TILE_SIZE}px`;
WRAPPER.style.backgroundColor = `${CURRENT_COLOR_MAP.backgroundColor}`;

const info = document.createElement('div');
// info.classList.add('info-panel');
// info.style.width = `${COLUMNS * TILE_SIZE}px`;
WRAPPER.appendChild(info);

let isKeyDown = false;
let keyDown = null;
let score = 0;
let initialTime = 0;
let currentTime = 0;
// let deltaTime = 0;
let fps = 5;
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

function Cell(x = 0, y = 0) {
	Point.call(this, x, y);
	this.color = randomColor();
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
			MAP.clearCell(this.lastPos.x, this.lastPos.y);
			child.setPos(child.x + x, child.y + y);
		} else {
			MAP.clearCell(child.x, child.y);
			this.setPos(this.lastChildPos, child.x, child.y);
			child.setPos(this.lastPos.x, this.lastPos.y);
			this.setPos(this.lastPos, this.lastChildPos.x, this.lastChildPos.y);
		}
	};
	this.update = (child, index) => {
		if(checkBit(GAME_STATE, 2)) this.move(child, 1, 0, index);
		else if(checkBit(GAME_STATE, 3)) this.move(child, -1, 0, index);
		else if(checkBit(GAME_STATE, 4)) this.move(child, 0, 1, index);
		else if(checkBit(GAME_STATE, 5)) this.move(child, 0, -1, index);
	};
	this.render = (child) => {
		const cell = MAP.clearCell(child.x, child.y);
		cell.style.boxShadow = `${CURRENT_COLOR_MAP.boxShadow}`;
		if (child.color) {
			// cell.style.borderRadius = `${'none'}`;
			cell.style.borderTopLeftRadius = `${'0px'}`;
			cell.style.borderTopRightRadius = `${'0px'}`;
			cell.style.borderRadius = `${CURRENT_COLOR_MAP.borderRadius}`;
			cell.style.backgroundColor = `${child.color}`;
			cell.style.borderColor = `${CURRENT_COLOR_MAP.cellBorderColor}`;
		} else {
			cell.style.borderRadius = `${'0px'}`;
			cell.style.borderTopLeftRadius = `${CURRENT_COLOR_MAP.isClassic ? '0px' : '50%'}`;
			cell.style.borderTopRightRadius = `${CURRENT_COLOR_MAP.isClassic ? '0px' : '50%'}`;
			cell.style.backgroundColor = `${CURRENT_COLOR_MAP.snakeColor}`;
			cell.style.borderColor = `${CURRENT_COLOR_MAP.cellBorderColor}`;
		}
	};
}

function Apple(x = 0, y = 0) {
	this.pos = new Point(x, y);
	this.setPos = (x, y) =>{
		this.pos.x = x;
		this.pos.y = y;
	};
	this.update = () => {
		let newApplePosX = getRandomInt(0, COLUMNS);
		let newApplePosY = getRandomInt(0, ROWS);
		apple.setPos(newApplePosX, newApplePosY);
	};
	this.render = () => {
		const cell = MAP.clearCell(this.pos.x, this.pos.y);
		cell.style.backgroundColor = `${CURRENT_COLOR_MAP.appleColor}`;
		cell.style.borderColor = `${CURRENT_COLOR_MAP.cellBorderColor}`;
	};
}

const snake = new Snake(6, 16);
const apple = new Apple(9, 3);

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
			cell.style.backgroundColor = `${CURRENT_COLOR_MAP.cellColor}`;
			cell.style.border = `1px solid ${CURRENT_COLOR_MAP.cellBorderColor}`;
			cell.style.borderRadius = `${CURRENT_COLOR_MAP.borderRadius}`;
			cell.style.width = `${TILE_SIZE}px`;
			cell.style.height = `${TILE_SIZE}px`;
			WRAPPER.appendChild(cell);
			MAP.data[column][row] = 0;
		} 
	}
}

function listeners() {
	document.addEventListener('keydown', e => {
		isKeyDown = true;
		keyDown = e.code;
		if(keyDown === PAUSE_MAP.key) GAME_STATE = switchBit(GAME_STATE, 1);
	});

	document.addEventListener('keyup', () => {
		isKeyDown = false;
		keyDown = null;
	});
}

function onGetApple() {
	return (snake.childs[0].x === apple.pos.x && snake.childs[0].y === apple.pos.y);
}

function showInfo(text, btnText = null, value = '') {
	info.classList.remove('middle');
	info.classList.add('info-panel');
	info.classList.add('anim-pop-up');
	info.style.display = 'block';
	info.innerHTML = `<p>${text}<span>${value}</span></p>`;
	if(btnText) {
		info.classList.remove('anim-pop-up');
		info.classList.add('middle');
		info.innerHTML += `<button onClick='${() => { 
			GAME_STATE = switchBit(GAME_STATE, 1);
			hideInfo();
		}}'>${btnText}</button>`;
	}
}

function hideInfo() {
	info.style.display = 'none';
	info.innerHTML = '';
}

function update() {
	if(isKeyDown) {
		if(DIRECTION_MAP[keyDown]) DIRECTION_MAP[keyDown]();
	}

	apple.render();

	snake.setPos(snake.lastPos, snake.childs[0].x, snake.childs[0].y);

	snake.childs.forEach((child, index) => {
		snake.update(child, index);
		snake.render(child);

		if(index > 0) {
			if(snake.childs[0].x === child.x && snake.childs[0].y === child.y) {
				console.log('Game over!');
			}
		}
	});

	if(onGetApple()) {
		MAP.clearCell(apple.pos.x, apple.pos.y);
		apple.update();
		apple.render();

		const Child = CURRENT_COLOR_MAP?.random ? Cell : Point;
		snake.childs.push(new Child(snake.lastPos.x, snake.lastPos.y));

		score += 10;
		showInfo('Score: ', null, score);
		window.setTimeout(hideInfo, 4000);
	}
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
	true: () => {
		showInfo('Ready To Play?', 'START');
	}
};

function gameLoop() {
	requestAnimationFrame(gameLoop);
	ON_PAUSE[checkBit(GAME_STATE, 1)]();
}

function start() {
	listeners();
	createMap();
	// snake.update();
	snake.render(snake.childs[0]);
	apple.render();
	initialTime = Date.now();
	requestAnimationFrame(gameLoop);
}

start();