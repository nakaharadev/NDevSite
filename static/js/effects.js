import * as gl from "./gl.js";
import { constants } from "./glConstants.js";

const PARTICLE_COUNT = 100;

const vertices = new Float32Array([
   -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
   -1.0,  1.0, 0.0,
   -1.0,  1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0,  1.0, 0.0,
]);

// Цвета для каждой вершины (R, G, B, A)
const texCoords = new Float32Array([
    0.0,  0.0,
    1.0,  0.0,
    0.0,  1.0,
    0.0,  1.0,
    1.0,  0.0,
    1.0,  1.0
]);

const zoomAnimation = {
    active: false,
    progress: 0,
    speed: 0.03,
    center: [0.5, 0.5], // Центр экрана
    targetLevel: 0.05,     // Уровень увеличения
    direction: 1.0
};

const particleData = new Float32Array(PARTICLE_COUNT * 2);

for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Заполняем случайными числами [0, 1]
    particleData[i * 2] = Math.random();
    particleData[i * 2 + 1] = Math.random();
}

let stopRender = 0;
let hideCallback = 0;

function render() {
    gl.checkErrors();

    // 1. Первый проход - частицы
    gl.useFramebuffer("particles");
    gl.clear(0, 0, 0, 0);
    
    gl.useShader("particles");
    
    const time = performance.now() / 1000;

    gl.setUniform1f("particles", "uTime", time);
    gl.setUniform1f("particles", "uParticleCount", PARTICLE_COUNT);
    gl.setUniform2f(
        "particles", "uResolution",
        gl.getSize(constants.SIZE_WIDTH),
        gl.getSize(constants.SIZE_HEIGHT)
    );

    gl.enable(constants.BLEND);
    gl.blendFunc(constants.SRC_ALPHA, constants.ONE);

    gl.useLocation("aRandomSeed");
    gl.drawArrays(constants.POINTS, 0, PARTICLE_COUNT);
    gl.disableLocation("aRandomSeed");

    // 2. Второй проход - композиция
    gl.disableFramebuffer();
    gl.clear(18/255, 18/255, 18/255, 1.0);
    
    gl.useShader("main");

    if (zoomAnimation.active) {
        zoomAnimation.progress = Math.min(zoomAnimation.progress + zoomAnimation.speed * zoomAnimation.direction, 1.0);
        if (
            zoomAnimation.progress >= 1.0 ||
            zoomAnimation.progress <= 0.0
        ) {
            zoomAnimation.active = false;
            if (zoomAnimation.progress >= 1.0)
                hideCallback();
        }
    }
    
    // Передача параметров в шейдер
    gl.setUniform2f("main", "uZoomCenter", ...zoomAnimation.center);
    gl.setUniform1f("main", "uZoomLevel", zoomAnimation.targetLevel);
    gl.setUniform1f("main", "uZoomProgress", zoomAnimation.progress);

    gl.useTexture(0, "uSampler", "main");
    gl.useTexture(1, "uDistortedMask", "main");
    gl.useFBOTexture(2, "uParticles", "particles", "main");
    gl.setUniform1f("main", "uTime", time);
    
    gl.useLocation("aPosition");
    gl.useLocation("aTex");
    gl.drawArrays(constants.TRIANGLES, 0, 6);
    gl.disableLocation("aPosition");
    gl.disableLocation("aTex");
}

export function createEffects() {
    gl.createGLContext(document.getElementById("canvas"));

    gl.checkExtension("OES_standard_derivatives");
    gl.checkExtension("ANGLE_instanced_arrays");

    gl.loadShader("main", "static/shaders/vertex.glsl", "static/shaders/fragment.glsl");
    gl.loadShader("particles", "static/shaders/vertexParticles.glsl", "static/shaders/fragmentParticles.glsl");

    gl.createStaticBuffer("vertex", vertices);
    gl.createStaticBuffer("texCoords", texCoords);
    gl.createStaticBuffer("random", particleData);

    gl.createFBO("particles", gl.getSize(constants.SIZE_WIDTH), gl.getSize(constants.SIZE_HEIGHT));

    gl.setLocation("vertex", "main", 'aPosition', 3)
    gl.setLocation("texCoords", "main", 'aTex', 2);
    gl.setLocation("random", "particles", "aRandomSeed", 2);

    gl.loadTextures(["uSampler", "uDistortedMask"], ["static/images/greeting-bg.png", "static/images/greeting-bg-distorted-mask.png"], () => {
        stopRender = gl.setDraw(render);
    });
}

export function stop() {
    stopRender();
}

export function start() {
    gl.setDraw(render);
}

export function hide(callback) {
    zoomAnimation.active = true;
    zoomAnimation.direction = 1.0;
    hideCallback = callback;
}

export function show() {
    zoomAnimation.active = true;
    zoomAnimation.direction = -1.0;
}