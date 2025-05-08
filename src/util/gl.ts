import { initGLConstants, constants } from "./glConstants";

interface GLContext {
    gl: WebGLRenderingContext | null;
    running: boolean;
    shaders: Record<string, WebGLProgram>;
    buffers: Record<string, WebGLBuffer>;
    framebuffers: Record<string, {
        framebuffer: WebGLFramebuffer;
        texture: WebGLTexture;
        width: number;
        height: number;
    }>;
    locations: Record<string, {
        location: number;
        buffer: WebGLBuffer;
        size: number;
    }>;
    textures: Record<string, WebGLTexture>;
    width: number;
    height: number;
}

let glContext: GLContext = {
    gl: null,
    running: true,
    shaders: {},
    buffers: {},
    framebuffers: {},
    locations: {},
    textures: {},
    width: 0,
    height: 0
};

function isPowerOf2(value: number): boolean {
    return (value & (value - 1)) === 0;
}

function getShader(name: string, type: number): WebGLShader | null {
    if (!glContext.gl) return null;

    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", name, false);
    xmlHttp.send(null);

    const shader = glContext.gl.createShader(type);
    if (!shader) return null;

    glContext.gl.shaderSource(shader, xmlHttp.responseText);
    glContext.gl.compileShader(shader);

    if (!glContext.gl.getShaderParameter(shader, glContext.gl.COMPILE_STATUS)) {
        console.error(`Ошибка компиляции шейдера ${name}:`, glContext.gl.getShaderInfoLog(shader));
        glContext.gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function getShaderProgram(vertexName: string, fragmentName: string): WebGLProgram | null {
    if (!glContext.gl) return null;

    const vertex = getShader(vertexName, constants.VERTEX_SHADER);
    const fragment = getShader(fragmentName, constants.FRAGMENT_SHADER);
    if (!vertex || !fragment) return null;

    const shaderProgram = glContext.gl.createProgram();
    if (!shaderProgram) return null;

    glContext.gl.attachShader(shaderProgram, vertex);
    glContext.gl.attachShader(shaderProgram, fragment);
    glContext.gl.linkProgram(shaderProgram);

    if (!glContext.gl.getProgramParameter(shaderProgram, glContext.gl.LINK_STATUS)) {
        console.error('Ошибка линковки программы:', glContext.gl.getProgramInfoLog(shaderProgram));
    }

    return shaderProgram;
}

export function createGLContext(canvas: HTMLCanvasElement): void {
    const gl = canvas.getContext('webgl');
    if (!gl) {
        alert('WebGL не поддерживается в вашем браузере!');
        throw new Error('WebGL not supported');
    }

    glContext.gl = gl;
    initGLConstants(gl);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    glContext.width = window.innerWidth;
    glContext.height = window.innerHeight;
}

export function checkExtension(name: string): boolean {
    if (!glContext.gl) return false;
    
    if (!glContext.gl.getExtension(name)) {
        console.warn(`${name} not supported`);
        return false;
    }

    return true;
}

export function loadShader(name: string, vertex: string, fragment: string): void {
    if (!glContext.gl) return;
    
    const program = getShaderProgram(vertex, fragment);
    if (program) {
        glContext.shaders[name] = program;
    }
}

export function createFBO(name: string, width: number, height: number): void {
    if (!glContext.gl) return;

    const texture = glContext.gl.createTexture();
    if (!texture) return;

    glContext.gl.bindTexture(constants.TEXTURE_2D, texture);
    glContext.gl.texImage2D(
        constants.TEXTURE_2D, 
        0, 
        constants.RGBA, 
        width, 
        height, 
        0, 
        constants.RGBA, 
        constants.UNSIGNED_BYTE, 
        null
    );
    
    glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_MIN_FILTER, constants.LINEAR);
    glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_MAG_FILTER, constants.LINEAR);
    glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_S, constants.CLAMP_TO_EDGE);
    glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_T, constants.CLAMP_TO_EDGE);
    
    const framebuffer = glContext.gl.createFramebuffer();
    if (!framebuffer) return;

    glContext.gl.bindFramebuffer(constants.FRAMEBUFFER, framebuffer);
    glContext.gl.framebufferTexture2D(
        constants.FRAMEBUFFER, 
        constants.COLOR_ATTACHMENT0, 
        constants.TEXTURE_2D, 
        texture, 
        0
    );
    
    const status = glContext.gl.checkFramebufferStatus(constants.FRAMEBUFFER);
    if (status !== constants.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer error:', status);
        return;
    }
    
    glContext.gl.bindFramebuffer(constants.FRAMEBUFFER, null);
    glContext.gl.bindTexture(constants.TEXTURE_2D, null);
    
    glContext.framebuffers[name] = { framebuffer, texture, width, height };
}

export function createStaticBuffer(name: string, data: BufferSource): void {
    if (!glContext.gl) return;

    const buffer = glContext.gl.createBuffer();
    if (!buffer) return;

    glContext.gl.bindBuffer(glContext.gl.ARRAY_BUFFER, buffer);
    glContext.gl.bufferData(glContext.gl.ARRAY_BUFFER, data, glContext.gl.STATIC_DRAW);

    glContext.buffers[name] = buffer;
}

export function setLocation(bufferName: string, shaderName: string, name: string, size: number): void {
    if (!glContext.gl) return;
    
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

    glContext.locations[name] = {
        location,
        buffer: glContext.buffers[bufferName],
        size
    };
}

export function loadTexture(name: string, url: string, callback: () => void): void {
    if (!glContext.gl) return;

    const texture = glContext.gl.createTexture();
    if (!texture) return;

    glContext.gl.bindTexture(constants.TEXTURE_2D, texture);
  
    const level = 0;
    const internalFormat = constants.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = constants.RGBA;
    const srcType = constants.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    
    glContext.gl.texImage2D(
        constants.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    );
  
    const image = new Image();
    image.onload = () => {
        if (!glContext.gl) return;

        glContext.gl.bindTexture(constants.TEXTURE_2D, texture);
        glContext.gl.texImage2D(
            constants.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
        );
    
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            glContext.gl.generateMipmap(constants.TEXTURE_2D);
        } else {
            glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_S, constants.CLAMP_TO_EDGE);
            glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_T, constants.CLAMP_TO_EDGE);
            glContext.gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_MIN_FILTER, constants.LINEAR);
        }

        glContext.textures[name] = texture;
        callback();
    };

    image.src = url;
}

export function loadTextures(names: string[], urls: string[], callback: () => void): void {
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

export function getSize(name: number): number {
    if (name === constants.SIZE_WIDTH) return glContext.width;
    if (name === constants.SIZE_HEIGHT) return glContext.height;
    return 0;
}

export function setDraw(func: (time: number) => void): () => void {
    if (!glContext.running) {
        glContext.running = true;
    }

    const loop = (time: number) => {
        if (!glContext.running || !glContext.gl) return;
        func(time);
        requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
    
    return () => { glContext.running = false; };
}

export function checkErrors(): void {
    if (!glContext.gl) return;

    const error = glContext.gl.getError();
    if (error !== constants.NO_ERROR) {
        console.error('WebGL error before render:', error);
    }
}

export function useShader(name: string): void {
    if (!glContext.gl || !glContext.shaders[name]) return;
    glContext.gl.useProgram(glContext.shaders[name]);
}

export function useFramebuffer(name: string): void {
    if (!glContext.gl || !glContext.framebuffers[name]) return;

    const framebuffer = glContext.framebuffers[name];
    glContext.gl.bindFramebuffer(glContext.gl.FRAMEBUFFER, framebuffer.framebuffer);
    glContext.gl.viewport(0, 0, framebuffer.width, framebuffer.height);
}

export function disableFramebuffer(): void {
    if (!glContext.gl) return;
    
    glContext.gl.bindFramebuffer(glContext.gl.FRAMEBUFFER, null);
    glContext.gl.viewport(0, 0, glContext.width, glContext.height);
}

export function clear(r: number, g: number, b: number, a: number): void {
    if (!glContext.gl) return;
    
    glContext.gl.clearColor(r, g, b, a);
    glContext.gl.clear(constants.COLOR_BUFFER_BIT);
}

export function setUniform1f(shaderName: string, name: string, value: number): void {
    if (!glContext.gl || !glContext.shaders[shaderName]) return;
    
    glContext.gl.uniform1f(
        glContext.gl.getUniformLocation(glContext.shaders[shaderName], name),
        value
    );
}

export function setUniform1i(shaderName: string, name: string, value: number): void {
    if (!glContext.gl || !glContext.shaders[shaderName]) return;
    
    glContext.gl.uniform1i(
        glContext.gl.getUniformLocation(glContext.shaders[shaderName], name),
        value
    );
}

export function setUniform2f(shaderName: string, name: string, value1: number, value2: number): void {
    if (!glContext.gl || !glContext.shaders[shaderName]) return;
    
    glContext.gl.uniform2f(
        glContext.gl.getUniformLocation(glContext.shaders[shaderName], name), 
        value1, 
        value2
    );
}

export function enable(value: number): void {
    if (!glContext.gl) return;
    glContext.gl.enable(value);
}

export function blendFunc(sfactor: number, dfactor: number): void {
    if (!glContext.gl) return;
    glContext.gl.blendFunc(sfactor, dfactor);
}

export function enableLocation(name: string): void {
    if (!glContext.gl || !glContext.locations[name]) {
        console.error(`Location ${name} not found!`);
        return;
    }
    
    const loc = glContext.locations[name];
    glContext.gl.bindBuffer(glContext.gl.ARRAY_BUFFER, loc.buffer);
    glContext.gl.enableVertexAttribArray(loc.location);
    glContext.gl.vertexAttribPointer(loc.location, loc.size, glContext.gl.FLOAT, false, 0, 0);
}

export function enableLocations(names: string[]): void {
    names.forEach((name) => {
        enableLocation(name);
    });
}

export function disableLocation(name: string): void {
    if (!glContext.gl || !glContext.locations[name]) return;
    
    const loc = glContext.locations[name];
    glContext.gl.disableVertexAttribArray(loc.location);
    glContext.gl.bindBuffer(glContext.gl.ARRAY_BUFFER, null);
}

export function disableLocations(names: string[]): void {
    names.forEach((name) => {
        disableLocation(name);
    });
}

export function drawArrays(mode: number, first: number, count: number): void {
    if (!glContext.gl) return;
    glContext.gl.drawArrays(mode, first, count);
}

export function useTexture(index: number, name: string, shader: string): void {
    if (!glContext.gl || !glContext.textures[name] || !glContext.shaders[shader]) return;
    
    glContext.gl.activeTexture(glContext.gl.TEXTURE0 + index);
    glContext.gl.bindTexture(glContext.gl.TEXTURE_2D, glContext.textures[name]);
    setUniform1i(shader, name, index);
}

export function useFBOTexture(index: number, name: string, framebuffer: string, shader: string): void {
    if (!glContext.gl || !glContext.framebuffers[framebuffer] || !glContext.shaders[shader]) return;
    
    glContext.gl.activeTexture(constants.TEXTURE0 + index);
    glContext.gl.bindTexture(constants.TEXTURE_2D, glContext.framebuffers[framebuffer].texture);
    setUniform1i(shader, name, index);
}

export function cleanup(): void {
    if (!glContext.gl) return;

    Object.values(glContext.shaders).forEach(program => {
        glContext.gl?.deleteProgram(program);
    });
    
    Object.values(glContext.buffers).forEach(buffer => {
        glContext.gl?.deleteBuffer(buffer);
    });
    
    glContext = {
        gl: glContext.gl,
        running: true,
        shaders: {},
        buffers: {},
        framebuffers: {},
        locations: {},
        textures: {},
        width: 0,
        height: 0
    };
}