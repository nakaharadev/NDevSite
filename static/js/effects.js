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

const particleData = new Float32Array(PARTICLE_COUNT * 2);

for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Заполняем случайными числами [0, 1]
    particleData[i * 2] = Math.random();
    particleData[i * 2 + 1] = Math.random();
}

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Ошибка компиляции шейдера:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function getShaderProgram(gl, vertexName, fragmentName) {
    const vertexShaderSource = getShader(vertexName);
    const fragmentShaderSource = getShader(fragmentName);

    const vertex = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragment = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertex);
    gl.attachShader(shaderProgram, fragment);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Ошибка линковки программы:', gl.getProgramInfoLog(shaderProgram));
    }

    return shaderProgram
}

function getShader(name) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", `static/shaders/${name}.glsl`, false);
    xmlHttp.send(null );
    return xmlHttp.responseText;
}

function prepareGL() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL не поддерживается в вашем браузере!');
        throw new Error('WebGL not supported');
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    return gl;
}

function getStaticBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer;
}

function setLocation(gl, buffer, shader, name, size) {
    const location = gl.getAttribLocation(shader, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);

    return location;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url, callback) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );
  
    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
        );
    
        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        callback(texture);
    };

    image.src = `static/images/${url}`;
}

function loadTextures(gl, shader, urls, samplers, callback) {
    let loadedCount = 0;
    const textures = {};
    
    urls.forEach((url, index) => {
        loadTexture(gl, url, (texture) => {
            textures[samplers[index]] = texture;
            
            // Устанавливаем uniform-переменную для сэмплера
            const samplerUniform = gl.getUniformLocation(shader, samplers[index]);
            gl.uniform1i(samplerUniform, index);
            
            loadedCount++;
            
            // Когда все текстуры загружены, вызываем callback
            if (loadedCount === urls.length) {
                callback(textures);
            }
        });
    });
}
  
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function createFBO(gl, width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
    // Добавляем параметры текстуры
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
    // Проверка статуса FBO
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer error:', status);
        return null;
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    return { framebuffer, texture, width, height };
}

function render(gl, shaders, textures, buffers) {
    // Проверка ошибок WebGL
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error('WebGL error before render:', error);
    }

    // 1. Первый проход - частицы в FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.fbo.framebuffer);
    gl.viewport(0, 0, buffers.fbo.width, buffers.fbo.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Настройка шейдера частиц
    gl.useProgram(shaders.particles.shader);
    
    // Установка uniform-переменных
    const time = performance.now() / 1000;
    gl.uniform1f(gl.getUniformLocation(shaders.particles.shader, "uTime"), time);
    gl.uniform1f(gl.getUniformLocation(shaders.particles.shader, "uParticleCount"), PARTICLE_COUNT);
    gl.uniform2f(gl.getUniformLocation(shaders.particles.shader, "uResolution"), 
                gl.canvas.width, gl.canvas.height);
    
    // Привязка буфера частиц
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.random);
    const aRandomSeed = gl.getAttribLocation(shaders.particles.shader, "aRandomSeed");
    gl.enableVertexAttribArray(aRandomSeed);
    gl.vertexAttribPointer(aRandomSeed, 2, gl.FLOAT, false, 0, 0);
    
    // Включение необходимых функций
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    // Рендерим частицы
    gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);
    
    // 2. Второй проход - композиция
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Настройка основного шейдера
    gl.useProgram(shaders.main.shader);
    
    // Привязка текстур
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures["uSampler"]);
    gl.uniform1i(gl.getUniformLocation(shaders.main.shader, "uSampler"), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures["uDistortedMask"]);
    gl.uniform1i(gl.getUniformLocation(shaders.main.shader, "uDistortedMask"), 1);
    
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, buffers.fbo.texture);
    gl.uniform1i(gl.getUniformLocation(shaders.main.shader, "uParticles"), 2);
    
    // Установка времени
    gl.uniform1f(gl.getUniformLocation(shaders.main.shader, "uTime"), time);
    
    // Рендерим полноэкранный квад
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    const positionLoc = gl.getAttribLocation(shaders.main.shader, "aPosition");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tex);
    const texCoordLoc = gl.getAttribLocation(shaders.main.shader, "aTex");
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    // Очистка состояний
    gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function animate(gl, shaders, textures, buffers) {
    requestAnimationFrame(() => animate(gl, shaders, textures, buffers)); // Рекурсивный вызов для следующего кадра
    render(gl, shaders, textures, buffers); // Отрисовка кадра
}

function main() {
    const gl = prepareGL();
    
    // Включение необходимых расширений
    if (!gl.getExtension('OES_standard_derivatives')) {
        console.warn('OES_standard_derivatives not supported');
    }
    if (!gl.getExtension('ANGLE_instanced_arrays')) {
        console.warn('ANGLE_instanced_arrays not supported');
    }

    const shaders = {
        main: {
            shader: getShaderProgram(gl, "vertex", "fragment")

        },
        particles: {
            shader: getShaderProgram(gl, "vertexParticles", "fragmentParticles")
        }
    };

    const buffers = {
        fbo: createFBO(gl, window.innerWidth, window.innerHeight),
        vertex: getStaticBuffer(gl, vertices),
        tex: getStaticBuffer(gl, texCoords),
        random: getStaticBuffer(gl, particleData)
    }

    setLocation(gl, buffers.vertex, shaders.main.shader, 'aPosition', 3)
    setLocation(gl, buffers.tex, shaders.main.shader, 'aTex', 2);
    setLocation(gl, buffers.random, shaders.particles.shader, "aRandomSeed", 2);

    loadTextures(gl, shaders.main.shader, ["greeting-bg.png", "greeting-bg-distorted-mask.png"], ["uSampler", "uDistortedMask"], (textures) => {
        animate(gl, shaders, textures, buffers);
    });
}

window.onload = main;