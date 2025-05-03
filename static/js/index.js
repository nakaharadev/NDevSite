function initScroll() {
    
}

function changePage(current, next) {
    if (current == next)
        return;

    current.classList.remove("nav-btn--active");
    next.classList.add("nav-btn--active");

    return next
}

function initNav() {
    let home = document.getElementById("nav-btn--home");
    let about = document.getElementById("nav-btn--about");
    let apps = document.getElementById("nav-btn--apps");
    let currentNav = home;

    home.onclick = () => {
        currentNav = changePage(currentNav, home);
    }

    about.onclick = () => {
        currentNav = changePage(currentNav, about);
    }

    apps.onclick = () => {
        currentNav = changePage(currentNav, apps);
    }
}

function main() {
    initNav();
    initScroll();
}

window.onload = () => {
    main();
};