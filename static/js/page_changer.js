let home = {
	elem: document.getElementById("nav-btn--home"),
	name: "greeting",
	use: (cb) => {
		changePage(home.elem);
		cb(
			{
				type: "page_change",
				current: nav[currentIndex],
				next: home
			}
		)
		currentIndex = 0;
	}
}
let about = {
	elem: document.getElementById("nav-btn--about"),
	name: "about",
	use: (cb) => {
		changePage(about.elem);
		cb(
			{
				type: "page_change",
				current: nav[current],
				next: about
			}
		)
		currentIndex = 1;
	}
}
let apps = {
	elem: document.getElementById("nav-btn--apps"),
	name: "apps",
	use: (cb) => {
		changePage(apps.elem);
		cb(
			{
				type: "page_change",
				current: nav[currentIndex],
				next: apps
			}
		)
		currentIndex = 2;
	}
}
const nav = [home, about, apps];
let currentIndex = 0;

class ScreenScroller {
	constructor(callback) {
		this.screens = document.querySelectorAll('.data-container');
		this.isAnimating = false;
		this.callback = callback;
	  
	  // Инициализация
		this.screens[0].style.transform = 'translateY(0)';
	  
	  // Обработчики событий
		window.addEventListener('wheel', this.handleScroll.bind(this));
		window.addEventListener('keydown', this.handleKeys.bind(this));
		window.addEventListener('touchstart', this.touchStart.bind(this));
		window.addEventListener('touchend', this.touchEnd.bind(this));
	  
		this.touchY = null;
	}
	
	handleScroll(e) {
		if (this.isAnimating) return;
	  
		if (e.deltaY > 0) {
			this.scrollDown();
		} else {
			this.scrollUp();
		}
	}
	
	handleKeys(e) {
		if (this.isAnimating) return;
	  
		if (e.key === 'ArrowDown') {
			this.scrollDown();
		} else if (e.key === 'ArrowUp') {
			this.scrollUp();
		}
	}
	
	touchStart(e) {
		this.touchY = e.touches[0].clientY;
	}
	
	touchEnd(e) {
		if (!this.touchY || this.isAnimating) return;
	  
		const diff = this.touchY - e.changedTouches[0].clientY;
		if (Math.abs(diff) < 50) return;
	  
		if (diff > 0) {
			this.scrollDown();
		} else {
			this.scrollUp();
		}
	}
	
	scrollDown() {
		this.isAnimating = true;
		console.log("Down");

		this.callback(
			{
				type: "scroll",
				direction: "down"
			}
		)
	}
	
	scrollUp() {
		this.isAnimating = true;
		console.log("Up");

		this.callback(
			{
				type: "scroll",
				direction: "up"
			}
		)
	}
}

function changePage(next) {
	if (nav[currentIndex] == next)
		return;

	nav[currentIndex].elem.classList.remove("nav-btn--active");
	next.classList.add("nav-btn--active");

	return next
}

export function initNav(callback) {
	nav.forEach(elem => {
		elem.elem.addEventListener('click', () => {
			if (current() != elem)
				elem.use(callback);
		});
	});

	new ScreenScroller(callback);
}

export function current() {
	return nav[currentIndex];
}