import { Game } from '/src/game';
import { clampFromZeroTo } from '/src/utils/math-utils';

let TILE_SIZE = 20;
let	DEVICE_WIDTH = window.innerWidth || window.screen.width;
let DEVICE_HEIGHT = window.innerHeight || window.screen.height;
let ROWS = Math.floor(DEVICE_HEIGHT / TILE_SIZE);
let COLUMNS = Math.floor(DEVICE_WIDTH / TILE_SIZE);

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

const COLOR_MAP = {
	noColor: 'unset',
	cellColor: '#fff',
	cellBorderColor: '#333',
	snakeColor: '#0f0',
	appleColor: '#f00',
};

const DIRECTION_MAP = {
	KeyD: 1, // right
	KeyA: -1, // left
	KeyS: 2,	// down
	KeyW: -2, // up
};

function MAP() {
	this.data = [];
	this.snakeCell = (row, column, color) => {
		this.data[row][column] = 1;
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.backgroundColor = color;
	},
	this.appleCell = (row, column) => {
		this.data[row][column] = 2;
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.backgroundColor = '#f00';
	},
	this.clearCell = (row, column) => {
		this.data[row][column] = 0;
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.backgroundColor = '#fff';
	},
	this.start = () => {};
	this.update = () => {};
	this.render = () => {
		for (let column = 0; column < COLUMNS; column++) {
			this.data.push([]);
			for (let row = 0; row < ROWS; row++) {
				const cell = document.createElement('div');
				cell.id = `${column}_${row}`;
				cell.style.backgroundColor = `${COLOR_MAP.cellColor}`;
				cell.style.border = `1px solid ${COLOR_MAP.cellBorderColor}`;
				cell.style.width = `${TILE_SIZE}px`;
				cell.style.height = `${TILE_SIZE}px`;
				WRAPPER.appendChild(cell);
				this.data[column][row] = 0;
			} 
		}
	};
	this.notify = () => {};
}

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

function Snake(x = 0, y = 0, map) {
	this.childs = [new Point(x, y)];
	this.lastPos = new Point(this.childs[0].x, this.childs[0].y);
	this.lastChildPos = new Point(this.childs[0].x, this.childs[0].y);
	this.direction = null;
	this.setDirection = (key) => {
		if(DIRECTION_MAP[key]) this.direction = DIRECTION_MAP[key];
	};
	this.setPos = (obj, x, y) =>{
		obj.x = x;
		obj.y = y;
	};
	this.move = (child, x, y, index) => {
		if (index === 0) {
			map.clearCell(child.x, child.y);
			child.setPos(child.x + x, child.y + y);
			map.snakeCell(child.x, child.y, COLOR_MAP.snakeColor);
		} else {
			this.setPos(this.lastChildPos, child.x, child.y);
			map.clearCell(this.lastChildPos.x, this.lastChildPos.y);
			child.setPos(this.lastPos.x, this.lastPos.y);
			map.snakeCell(this.lastPos.x, this.lastPos.y, COLOR_MAP.snakeColor);
			this.setPos(this.lastPos, this.lastChildPos.x, this.lastChildPos.y);
		}
	};
	this.start = () => {};
	this.update = () => {
		this.setPos(this.lastPos, this.childs[0].x, this.childs[0].y);

		this.childs.forEach((child, index) => {
			if(this.direction === 1) this.move(child, 1, 0, index);
			else if(this.direction === -1) this.move(child, -1, 0, index);
			else if(this.direction === 2) this.move(child, 0, 1, index);
			else if(this.direction === -2) this.move(child, 0, -1, index);
		});
	};
	this.render = () => {};
	this.notify = (value) => { this.setDirection(value); };
}

const map = new MAP();
const snake = new Snake(6, 16, map);
const apple = new Point(9, 3);

// const game = new Game([new MAP(), new Snake(6, 16)]);
const game = new Game();
game.subscribe(map);
game.subscribe(snake);
game.start();
game.update();
game.render();
