import { createEffects, hide, show } from "./effects.js";
import { initNav, current } from "./page_changer.js";

function change(next) {
    console.log(next);
    let nextContainer = document.getElementById(`${next.name}-container`);
    let currentContainer = document.getElementById(`${current().name}-container`)

    if (current().name == "greeting") {
        currentContainer.classList.remove('come-left');
        currentContainer.classList.add('exit-left');

        hide(() => {            
            nextContainer.scrollIntoView({
                top: nextContainer.offsetTop - 70,
                behavior: 'auto'
            });

            nextContainer.classList.remove('exit-left');
            nextContainer.classList.add('come-left');
        });
    } else {
        currentContainer.classList.remove('come-left');
        currentContainer.classList.add('exit-left');

        setTimeout(() => {
            nextContainer.scrollIntoView({
                top: nextContainer.offsetTop - 70,
                behavior: 'auto'
            });
    
            nextContainer.classList.remove('exit-left');
            nextContainer.classList.add('come-left');
            if (next.name == "greeting")
                show();
        }, 350);
    }
}

function scroll(direction) {

}

function navCallback(cbData) {
    if (cbData.type == "page_change") {
        change(cbData.next);
    } else {
        scroll(cbData.direction);
    }
}

function main() {
    createEffects();
    initNav(navCallback);
}

window.onload = main;