import { constants, initGLConstants } from "./glConstants.js";

let glContext = {
    running: true,
    shaders: {},
    buffers: {},
    framebuffers: {},
    locations: {},
    textures: {}
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function getShader(name, type) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", name, false);
    xmlHttp.send(null);

    const shader = glContext.gl.createShader(type);
    glContext.gl.shaderSource(shader, xmlHttp.responseText);
    glContext.gl.compileShader(shader);

    if (!glContext.gl.getShaderParameter(shader, glContext.gl.COMPILE_STATUS)) {
        console.error(`Ошибка компиляции шейдера ${name}:`, glContext.gl.getShaderInfoLog(shader));
        glContext.gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function getShaderProgram(vertexName, fragmentName) {
    const vertex = getShader(vertexName, constants.VERTEX_SHADER);
    const fragment = getShader(fragmentName, constants.FRAGMENT_SHADER);

    const shaderProgram = glContext.gl.createProgram();
    glContext.gl.attachShader(shaderProgram, vertex);
    glContext.gl.attachShader(shaderProgram, fragment);
    glContext.gl.linkProgram(shaderProgram);

    if (!glContext.gl.getProgramParameter(shaderProgram, glContext.gl.LINK_STATUS)) {
        console.error('Ошибка линковки программы:', glContext.gl.getProgramInfoLog(shaderProgram));
    }

    return shaderProgram
}

export function createGLContext(canvas) {
    glContext.gl = canvas.getContext('webgl');

    if (!glContext.gl) {
        alert('WebGL не поддерживается в вашем браузере!');
        throw new Error('WebGL not supported');
    }

    initGLConstants(glContext.gl);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    glContext.gl.viewport(0, 0, glContext.gl.drawingBufferWidth, glContext.gl.drawingBufferHeight);

    glContext.width = window.innerWidth;
    glContext.height = window.innerHeight;
}

export function checkExtension(name) {
    if (!glContext.gl.getExtension(name)) {
        console.warn(`${name} not supported`);
        return false;
    }

    return true;
}

export function loadShader(name, vertex, fragment) {
    glContext.shaders[name] = getShaderProgram(vertex, fragment);
}

export function createFBO(name, width, height) {
    const texture = glContext.gl.createTexture();
    glContext.gl.bindTexture(constants.TEXTURE_2D, texture);
    glContext.gl.texImage2D(constants.TEXTURE_2D, 0, constants.RGBA, width, height, 0, constants.RGBA, constants.UNSIGNED_BYTE, null);
    
    // Добавляем параметры текстуры
    glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_MIN_FILTER, constants.LINEAR);
    glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_MAG_FILTER, constants.LINEAR);
    glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_S, constants.CLAMP_TO_EDGE);
    glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_T, constants.CLAMP_TO_EDGE);
    
    const framebuffer = glContext.gl.createFramebuffer();
    glContext.gl.bindFramebuffer(constants.FRAMEBUFFER, framebuffer);
    glContext.gl.framebufferTexture2D(constants.FRAMEBUFFER, constants.COLOR_ATTACHMENT0, constants.TEXTURE_2D, texture, 0);
    
    // Проверка статуса FBO
    const status = glContext.gl.checkFramebufferStatus(constants.FRAMEBUFFER);
    if (status !== constants.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer error:', status);
        return null;
    }
    
    glContext.gl.bindFramebuffer(constants.FRAMEBUFFER, null);
    glContext.gl.bindTexture(constants.TEXTURE_2D, null);
    
    glContext.framebuffers[name] = { framebuffer, texture, width, height };
}

export function createStaticBuffer(name, data) {
    const buffer = glContext.gl.createBuffer();
    glContext.gl.bindBuffer(glContext.gl.ARRAY_BUFFER, buffer);
    glContext.gl.bufferData(glContext.gl.ARRAY_BUFFER, data, glContext.gl.STATIC_DRAW);

    glContext.buffers[name] = buffer;
}

export function setLocation(bufferName, shaderName, name, size) {
    if (!glContext.shaders[shaderName]) {
        console.error(`Shader ${shaderName} not found!`);
        return;
    }
    if (!glContext.buffers[bufferName]) {
        console.error(`Buffer ${bufferName} not found!`);
        return;
    }

    const location = glContext.gl.getAttribLocation(glContext.shaders[shaderName], name);
    if (location === -1) {
        console.error(`Attribute ${name} not found in shader ${shaderName}`);
        return;
    }

    // Сохраняем информацию о буфере для этого атрибута
    glContext.locations[name] = {
        location: location,
        buffer: glContext.buffers[bufferName],
        size: size
    };
}

export function loadTexture(name, url, callback) {
    const texture = glContext.gl.createTexture();
    glContext.gl.bindTexture(constants.TEXTURE_2D, texture);
  
    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = constants.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = constants.RGBA;
    const srcType = constants.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    glContext.gl.texImage2D(
        constants.TEXTURE_2D,
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
        glContext.gl.bindTexture(constants.TEXTURE_2D, texture);
        glContext.gl.texImage2D(
            constants.TEXTURE_2D,
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
            glContext.gl.generateMipmap(constants.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_S, constants.CLAMP_TO_EDGE);
            glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_T, constants.CLAMP_TO_EDGE);
            glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_MIN_FILTER, constants.LINEAR);
        }

        glContext.textures[name] = texture;
        callback();
    };

    image.src = url;
}

export function loadTextures(names, urls, callback) {
    let loadedCount = 0;
    
    urls.forEach((url, index) => {
        loadTexture(names[index], url, () => {
            loadedCount++;
            
            if (loadedCount === urls.length) {
                callback();
            }
        });
    });
}

export function getSize(name) {
    if (name == constants.SIZE_WIDTH)
        return glContext.width;
    if (name == constants.SIZE_HEIGHT)
        return glContext.height;
}

export function setDraw(func) {
    if (!glContext.running)
        glContext.running = true;

    const loop = (time) => {
        if (!glContext.running) return;
        func(time);
        requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
    
    // Возвращаем функцию для остановки
    return () => { glContext.running = false; };
}

export function checkErrors() {
    const error = glContext.gl.getError();
    if (error !== constants.NO_ERROR) {
        console.error('WebGL error before render:', error);
    }
}

export function useShader(name) {
    glContext.gl.useProgram(glContext.shaders[name]);
}

export function useFramebuffer(name) {
    const framebuffer = glContext.framebuffers[name];

    glContext.gl.bindFramebuffer(
        glContext.gl.FRAMEBUFFER,
        framebuffer.framebuffer
    );
    glContext.gl.viewport(
        0, 0,
        framebuffer.width,
        framebuffer.height
    )
}

export function disableFramebuffer() {
    glContext.gl.bindFramebuffer(glContext.gl.FRAMEBUFFER, null);
    glContext.gl.viewport(0, 0, glContext.width, glContext.height);
}

export function clear(r, g, b, a) {
    glContext.gl.clearColor(r, g, b, a);
    glContext.gl.clear(constants.COLOR_BUFFER_BIT);
}

export function setUniform1f(shaderName, name, value) {
    glContext.gl.uniform1f(
        glContext.gl.getUniformLocation(glContext.shaders[shaderName], name),
        value
    );
}

export function setUniform1i(shaderName, name, value) {
    glContext.gl.uniform1i(
        glContext.gl.getUniformLocation(glContext.shaders[shaderName], name),
        value
    );
}

export function setUniform2f(shaderName, name, value1, value2) {
    glContext.gl.uniform2f(
        glContext.gl.getUniformLocation(glContext.shaders[shaderName], name), 
        value1, value2
    );
}

export function enable(value) {
    glContext.gl.enable(value);
}

export function blendFunc(sfactor, dfactor) {
    glContext.gl.blendFunc(sfactor, dfactor)
}

export function useLocation(name) {
    if (!glContext.locations[name]) {
        console.error(`Location ${name} not found!`);
        return;
    }
    
    const loc = glContext.locations[name];
    glContext.gl.bindBuffer(glContext.gl.ARRAY_BUFFER, loc.buffer);
    glContext.gl.enableVertexAttribArray(loc.location);
    glContext.gl.vertexAttribPointer(loc.location, loc.size, glContext.gl.FLOAT, false, 0, 0);
}

export function useLocations(names) {
    names.forEach((name) => {
        useLocation(name);
    });
}

export function disableLocation(name) {
    if (!glContext.locations[name]) return;
    
    const loc = glContext.locations[name];
    glContext.gl.disableVertexAttribArray(loc.location);
    glContext.gl.bindBuffer(glContext.gl.ARRAY_BUFFER, null);
}

export function disableLocations(names) {
    names.forEach((name) => {
        disableLocation(name);
    });
}

export function drawArrays(mode, first, count) {
    glContext.gl.drawArrays(mode, first, count);
}

export function useTexture(index, name, shader) {
    glContext.gl.activeTexture(glContext.gl.TEXTURE0 + index);
    glContext.gl.bindTexture(glContext.gl.TEXTURE_2D, glContext.textures[name]);
    setUniform1i(shader, name, index)
}

export function useFBOTexture(index, name, framebuffer, shader) {
    glContext.gl.activeTexture(constants.TEXTURE0 + index);
    glContext.gl.bindTexture(constants.TEXTURE_2D, glContext.framebuffers[framebuffer].texture);
    setUniform1i(shader, name, index)
}

export function cleanup() {
    Object.values(glContext.shaders).forEach(program => {
        glContext.gl.deleteProgram(program);
    });
    
    Object.values(glContext.buffers).forEach(buffer => {
        glContext.gl.deleteBuffer(buffer);
    });
    
    glContext = {
        shaders: {},
        buffers: {},
        framebuffers: {},
        locations: {},
        textures: {}
    };
}