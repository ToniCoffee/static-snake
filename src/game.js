function Keyboard() {
	this.keyDown = null;
	this.keyUp = null;
	this.subscribers = [];
	this.subscribe = (obj) => this.subscribers.push(obj);
	this.notify = (value) => this.subscribers.forEach(subscriber => subscriber.notify(value));
}

function listeners(keyboard) {
	document.addEventListener('keydown', e => {
		keyboard.keyDown = e.code;
		keyboard.keyUp = null;
		keyboard.notify(keyboard.keyDown);
	});
	document.addEventListener('keyup', e => {
		keyboard.keyUp = e.code;
		keyboard.keyDown = null;
		// keyboard.notify(keyboard.keyUp);
	});
}

export function Game() {
	const kbrd = new Keyboard();
	kbrd.subscribe(this);
	this.initialTime = Date.now();
	this.currentTime = Date.now();
	// this.deltaTime = 0;
	this.fps = 10;
	this.fpsInterval = 1000 / this.fps;
	this.keyboard = {
		get keyDown() { return kbrd.keyDown; },
		get keyUp() { return kbrd.keyUp; }
	};
	this.pause = false;
	this.subscribers = [];
	this.subscribe = (obj) => this.subscribers.push(obj);
	this.notify = (value) => {
		if(value === 'KeyP') this.pause = !this.pause;
		this.subscribers.forEach(subscriber => subscriber.notify(value));
	};

	const requestAnimationFrame = window.requestAnimationFrame 				|| 
																window.mozRequestAnimationFrame 		||
																window.webkitRequestAnimationFrame 	|| 
																window.msRequestAnimationFrame;

	const cancelAnimationFrame =	window.cancelAnimationFrame || 
																window.mozCancelAnimationFrame;

	this.awake = () => {
		console.log('awake!');
	};

	this.start = () => {
		console.log('start!');
		this.subscribers.forEach(entity => entity.start());
	};

	this.update = () => {
		requestAnimationFrame(this.update);
		
		if(!this.pause) {
			// console.log('update!');
			this.currentTime = Date.now();
			let interval = this.currentTime - this.initialTime;

			if(interval >= this.fpsInterval) {
				// initialTime = currentTime;
				this.subscribers.forEach(entity => entity.update());
				this.initialTime = this.currentTime - (interval % this.fpsInterval);
			}
		}
		// console.log('update!');
	};

	this.fixedUpdate = () => {
		console.log('fixedUpdate!');
	};

	this.lastUpdate = () => {
		console.log('lastUpdate!');
	};

	this.render = () => {
		console.log('render!');
		this.subscribers.forEach(entity => entity.render());
	};

	listeners(kbrd);
	/* this.awake();
	this.start();
	this.update();
	this.fixedUpdate();
	this.lastUpdate();
	this.render(); */
	// requestAnimationFrame(this.update);
}