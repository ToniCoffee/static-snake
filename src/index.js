import { randomColor, removeChilds, onMobileDoubleClick } from '/src/utils/common-utils';
import { getRandomInt } from '/src/utils/math-utils';
import { checkBit, setBit, clearBit, clearBits, switchBit } from '/src/utils/bit-utils';
import { THEMES } from '/src/themes';

import '/src/styles.css';

let snake = null;
let apple = null;
let isKeyDown = false;
let keyDown = null;
let score = 0;
let numberOfPoints = 0;
let level = 1;
let levelIncreaseThreshold = 15;
let initialTime = 0;
let currentTime = 0;
// let deltaTime = 0;
let fps = 5;
let fpsInterval = 1000 / fps;
const maxFps = 10;
let animationFrameID = null;
let requestAnimationFrame = window.requestAnimationFrame || 
														window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || 
														window.msRequestAnimationFrame;
let cancelAnimationFrame = 	window.cancelAnimationFrame || 
														window.mozCancelAnimationFrame;
let CURRENT_COLOR_MAP = THEMES.classic;

let GAME_STATE = 0x03;
/* GAME_STATE = { // 0000_0000_0000_0011
	// bit 1 --> alive / dead;
	// bit 2 --> paused / running;
	// bit 3 --> moving right;
	// bit 4 --> moving left;
	// bit 5 --> moving down;
	// bit 6 --> moving up;
}; */

const TILE_SIZE = 20;
const MAX_DEVICE_WIDTH = 480;
let DEVICE_WIDTH = window.innerWidth || window.screen.width;
const DEVICE_HEIGHT = window.innerHeight || window.screen.height;

if(DEVICE_WIDTH > MAX_DEVICE_WIDTH) DEVICE_WIDTH = MAX_DEVICE_WIDTH;

const ROWS = Math.floor(DEVICE_HEIGHT / TILE_SIZE);
const COLUMNS = Math.floor(DEVICE_WIDTH / TILE_SIZE);

const WRAPPER = document.querySelector('.wrapper');
WRAPPER.style.width = `${COLUMNS * TILE_SIZE}px`;
WRAPPER.style.height = `${ROWS * TILE_SIZE}px`;
WRAPPER.style.backgroundColor = `${CURRENT_COLOR_MAP.backgroundColor}`;

const info = document.createElement('div');

const MAP = {
	data: [],
	setCellRotation: (row, column, degrees) => {
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.transform = `rotate(${degrees}deg)`;
		return cell;
	},
	clearCell: (row, column) => {
		const cell = document.getElementById(`${row}_${column}`);
		cell.style.backgroundColor = `${CURRENT_COLOR_MAP.clearColor}`;
		cell.style.borderColor = `${CURRENT_COLOR_MAP.clearColor}`;
		cell.style.boxShadow = 'none';
		return cell;
	},
};

const KEY_MAP = {
	KeyD: 'KeyD',
	ArrowRight: 'ArrowRight',
	KeyA: 'KeyA',
	ArrowLeft: 'ArrowLeft',
	KeyS: 'KeyS',
	ArrowDown: 'ArrowDown',
	KeyW: 'KeyW',
	ArrowUp: 'ArrowUp',
	KeyP: 'KeyP',
	Space: 'Space'
};

function directionRight() {
	if(!checkBit(GAME_STATE, 3)) {
		GAME_STATE = clearBits(GAME_STATE, [3, 4, 5]);
		GAME_STATE = setBit(GAME_STATE, 2);
	}
}

function directionLeft() {
	if(!checkBit(GAME_STATE, 2)) {
		GAME_STATE = clearBits(GAME_STATE, [2, 4, 5]);
		GAME_STATE = setBit(GAME_STATE, 3);
	}
}

function directionDown() {
	if(!checkBit(GAME_STATE, 5)) {
		GAME_STATE = clearBits(GAME_STATE, [2, 3, 5]);
		GAME_STATE = setBit(GAME_STATE, 4);
	}
}

function directionUp() {
	if(!checkBit(GAME_STATE, 4)) {
		GAME_STATE = clearBits(GAME_STATE, [2, 3, 4]);
		GAME_STATE = setBit(GAME_STATE, 5);
	}
}

const DIRECTION_MAP = {
	KeyD: directionRight, // right
	ArrowRight: directionRight,
	KeyA: directionLeft, // left
	ArrowLeft: directionLeft, // left
	KeyS: directionDown,	// down
	ArrowDown: directionDown,	// down
	KeyW: directionUp, // up
	ArrowUp: directionUp, // up
	null: () => {},
	undefined: () => {} 
};

function customSelectOptions(appendTo, labelText = '', options = {}, onSelectOption = () => {}) {
	const select = document.createElement('div');
	const pSelect = document.createElement('p');
	const btnSelect = document.createElement('button');
	const optionsContainer = document.createElement('div');

	btnSelect.innerText = '^';
	btnSelect.classList.add('custom-select-btn');
	optionsContainer.classList.add('custom-select-options-container');
	optionsContainer.classList.add('display-none');
	select.id = 'custom-select';
	select.classList.add('custom-select');

	for (const key in options) {
		const option = document.createElement('div');
		option.classList.add('custom-select-options');
		option.innerText = key;
		optionsContainer.appendChild(option);
		option.onclick = (e) => {
			pSelect.innerText = e.target.innerText;
			onSelectOption(e);
		};
	}

	pSelect.innerText = optionsContainer.children[0].innerText;

	btnSelect.onclick = () => {
		optionsContainer.classList.toggle('display-none');
	};

	select.appendChild(pSelect);
	select.appendChild(btnSelect);

	if(appendTo){
		if(labelText && labelText.length > 0) {
			const label = document.createElement('label');
			label.innerText = labelText;
			label.htmlFor = 'custom-select';
			appendTo.appendChild(label);
		}
		appendTo.appendChild(select);
		appendTo.appendChild(optionsContainer);
	}
}

function initialPage() {
	const header = document.createElement('header');
	const h1 = document.createElement('h1');
	const divTheme = document.createElement('div');
	const divScore = document.createElement('div');
	const p1 = document.createElement('p');
	const p2 = document.createElement('p');
	const btn = document.createElement('button');

	header.classList.add('initial-page');
	divTheme.classList.add('initial-page-theme');
	divScore.classList.add('initial-page-score');
	btn.classList.add('initial-page-btn-anim');
	h1.innerText = 'SNAKE GAME';
	p1.innerHTML = `<span>Max Score: </span><span>${500}</span>`;
	p2.innerHTML = `<span>Max Level: </span><span>${20}</span>`;
	btn.innerText = 'PLAY';
	btn.onclick = () => {
		GAME_STATE = clearBit(GAME_STATE, 1);
		const randomDirection = getRandomInt(2, 6);
		GAME_STATE = setBit(GAME_STATE, randomDirection);
		hideInfo();
		WRAPPER.removeChild(header);
		start();
	};

	divScore.appendChild(p1);
	divScore.appendChild(p2);
	customSelectOptions(divTheme, 'Choose Theme', THEMES, (e) => {
		CURRENT_COLOR_MAP = THEMES[e.target.innerText];
	});
	header.appendChild(h1);
	header.appendChild(divTheme);
	header.appendChild(divScore);
	header.appendChild(btn);
	WRAPPER.appendChild(header);
}

function gameoverPage() {
	const container = document.createElement('div');
	const h1 = document.createElement('h1');
	const divScore = document.createElement('div');
	const p1 = document.createElement('p');
	const p2 = document.createElement('p');
	const btn = document.createElement('button');

	container.classList.add('initial-page');
	btn.classList.add('initial-page-btn-anim');
	divScore.classList.add('initial-page-score');
	h1.innerText = 'GAME OVER';
	p1.innerHTML = `<span>Score: </span><span>${score}</span>`;
	p2.innerHTML = `<span>Level: </span><span>${level}</span>`;
	btn.innerText = 'PLAY';
	btn.onclick = () => {
		reset();
		removeChilds(WRAPPER);
		initialize();
	};

	divScore.appendChild(p1);
	divScore.appendChild(p2);
	container.appendChild(h1);
	container.appendChild(divScore);
	container.appendChild(btn);
	WRAPPER.appendChild(container);
}

function reset() {
	GAME_STATE = 0x03;
	snake = null;
	apple = null;
	score = 0;
	numberOfPoints = 0;
	level = 1;
	fps = 5;
	fpsInterval = 1000 / fps;
	CURRENT_COLOR_MAP = THEMES.classic;
}

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
	this.move = (child, x, y, index, rotation) => {
		if (index === 0) {
			MAP.clearCell(this.lastPos.x, this.lastPos.y);
			child.setPos(child.x + x, child.y + y);
			MAP.setCellRotation(child.x, child.y, rotation);
		} else {
			MAP.clearCell(child.x, child.y);
			this.setPos(this.lastChildPos, child.x, child.y);
			child.setPos(this.lastPos.x, this.lastPos.y);
			this.setPos(this.lastPos, this.lastChildPos.x, this.lastChildPos.y);
		}
	};
	this.add = () => {
		const Child = CURRENT_COLOR_MAP?.random ? Cell : Point;
		this.childs.push(new Child(this.lastPos.x, this.lastPos.y));
	};
	this.update = (child, index) => {
		if(checkBit(GAME_STATE, 2)) this.move(child, 1, 0, index, 90);
		else if(checkBit(GAME_STATE, 3)) this.move(child, -1, 0, index, -90);
		else if(checkBit(GAME_STATE, 4)) this.move(child, 0, 1, index, 180);
		else if(checkBit(GAME_STATE, 5)) this.move(child, 0, -1, index, 0);
	};
	this.render = (child) => {
		const cell = MAP.clearCell(child.x, child.y);
		cell.style.boxShadow = `${CURRENT_COLOR_MAP.boxShadow}`;
		if (child.color) {
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

function onGetApple() {
	return (snake.childs[0].x === apple.pos.x && snake.childs[0].y === apple.pos.y);
}

function infoPanel(text, btnText = null, value = '') {
	info.classList.add('info-panel');
	info.classList.add('middle');
	info.style.display = 'grid';
	info.innerHTML = `<h2>${text}<span>${value}</span></h2>`;
	const backDrop = document.createElement('div');
	backDrop.classList.add('backdrop');
	const div = document.createElement('div');
	div.classList.add('info-div');
	const p1 = document.createElement('p');
	const p2 = document.createElement('p');
	p1.innerHTML = `<span>Score: </span><span>${score}</span>`;
	p2.innerHTML = `<span>Level: </span><span>${level}</span>`;

	div.appendChild(p1);
	div.appendChild(p2);
	info.appendChild(backDrop);
	info.appendChild(div);
	
	if(btnText) {
		const btn = document.createElement('button');
		btn.innerHTML = btnText;
		btn.onclick = () => {
			GAME_STATE = switchBit(GAME_STATE, 1);
			hideInfo();
		};
		info.appendChild(btn);
	}
}

function popupPanel(text, value = '') {
	const popup = document.createElement('div');
	WRAPPER.appendChild(popup);
	popup.classList.add('popup');
	popup.classList.add('anim-pop-up');
	popup.style.display = 'block';
	popup.innerHTML = `<p>${text}<span>${value}</span></p>`;
	window.setTimeout(() => {
		WRAPPER.removeChild(popup);
		popup.style.display = 'none';
		popup.innerHTML = '';
	}, 4000);
	return popup;
}

function hideInfo() {
	info.style.display = 'none';
	info.innerHTML = '';
}

function increaseLevel() {
	numberOfPoints = 0;
	level += 1;
	if(fps < maxFps) {
		fps += 1;
		fpsInterval = 1000 / fps;
	}
	popupPanel('Level: ', level).style.border = '1px solid #0f0';
}

function increaseScore() {
	score += 10;
	numberOfPoints += 1;
	if(numberOfPoints >= levelIncreaseThreshold) increaseLevel();
	else popupPanel('Score: ', score);
}

function onGameover(child, index) {
	if(index > 0) {
		if(snake.childs[0].x === child.x && snake.childs[0].y === child.y) {
			cancelAnimationFrame(animationFrameID);
			gameoverPage();
		}
	}
}

function switchPause() {
	GAME_STATE = switchBit(GAME_STATE, 1);
	if(!checkBit(GAME_STATE, 1)) hideInfo();
}

function listeners() {
	document.addEventListener('keydown', e => {
		isKeyDown = true;
		keyDown = e.code;
		if(keyDown === KEY_MAP.KeyP || keyDown === KEY_MAP.Space) switchPause();
	});
	
	document.addEventListener('keyup', () => {
		isKeyDown = false;
		keyDown = null;
	});

	let startX, startY, offset = 10, lastClickTime = 0;

	document.addEventListener('touchstart', e => {
		e.preventDefault();
		lastClickTime = onMobileDoubleClick(e, switchPause, lastClickTime, 200);
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
	});

	document.addEventListener('touchmove', e => {
		if(e.touches[0].clientX > startX + offset) keyDown = KEY_MAP.KeyD;
		else if(e.touches[0].clientX < startX - offset) keyDown = KEY_MAP.KeyA;
		else if(e.touches[0].clientY > startY + offset) keyDown = KEY_MAP.KeyS;
		else if(e.touches[0].clientY < startY - offset) keyDown = KEY_MAP.KeyW;
		isKeyDown = true;
	});

	document.addEventListener('touchend', () => {
		keyDown = null;
		isKeyDown = false;
	});
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
		onGameover(child, index);
	});

	if(onGetApple()) {
		MAP.clearCell(apple.pos.x, apple.pos.y);
		apple.update();
		apple.render();
		snake.add();
		increaseScore();
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
		infoPanel('STATE', 'CONTINUE');
	}
};

function gameLoop() {
	animationFrameID = requestAnimationFrame(gameLoop);
	ON_PAUSE[checkBit(GAME_STATE, 1)]();
}

function initialize() {
	initialPage();
}

function awake() {
	listeners();
}

function start() {
	createMap();
	WRAPPER.appendChild(info);
	snake = new Snake(6, 16);
	apple = new Apple(9, 3);
	snake.render(snake.childs[0]);
	apple.render();
	initialTime = Date.now();
	requestAnimationFrame(gameLoop);
}

awake();
initialize();