const vertices = new Float32Array([
    0.0,  0.5, 0.0,  // Верхняя вершина
    -0.5, -0.5, 0.0,  // Левая нижняя
    0.5, -0.5, 0.0   // Правая нижняя
]);

// Цвета для каждой вершины (R, G, B, A)
const colors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,  // Красный (верх)
    0.0, 1.0, 0.0, 1.0,  // Зелёный (левый низ)
    0.0, 0.0, 1.0, 1.0   // Синий (правый низ)
]);

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

function getShaderProgram(gl, vertex, fragment) {
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
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);

    return location;
}

function render(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}


function main() {
    let gl = prepareGL();
    
    const vertexShaderSource = getShader("vertex");
    const fragmentShaderSource = getShader("fragment");
    
    const shaderProgram = getShaderProgram(
        gl,
        compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER),
        compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)
    )

    gl.useProgram(shaderProgram);

    const vertexBuffer = getStaticBuffer(gl, vertices);
    const colorBuffer = getStaticBuffer(gl, colors);

    const aPosition = setLocation(gl, vertexBuffer, shaderProgram, 'aPosition', 3);
    const aColor = setLocation(gl, colorBuffer, shaderProgram, 'aColor', 4);

    render(gl);
}

window.onload = main;