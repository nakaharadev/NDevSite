interface GLConstants {
    // Размеры
    SIZE_WIDTH: number;
    SIZE_HEIGHT: number;

    // Буферы и текстуры
    ARRAY_BUFFER: number;
    STATIC_DRAW: number;
    TEXTURE_2D: number;
    TEXTURE0: number;
    TEXTURE_MIN_FILTER: number;
    TEXTURE_MAG_FILTER: number;
    TEXTURE_WRAP_S: number;
    TEXTURE_WRAP_T: number;
    LINEAR: number;
    CLAMP_TO_EDGE: number;
    RGBA: number;
    UNSIGNED_BYTE: number;

    // FBO
    FRAMEBUFFER: number;
    COLOR_ATTACHMENT0: number;
    FRAMEBUFFER_COMPLETE: number;

    // Режимы отрисовки
    POINTS: number;
    TRIANGLES: number;
    TRIANGLE_STRIP: number;

    // Блендинг
    BLEND: number;
    SRC_ALPHA: number;
    ONE: number;
    ONE_MINUS_SRC_ALPHA: number;

    // Очистка
    COLOR_BUFFER_BIT: number;
    DEPTH_BUFFER_BIT: number;

    // Ошибки
    NO_ERROR: number;

    // Шейдеры
    VERTEX_SHADER: number;
    FRAGMENT_SHADER: number;
}

export let constants: GLConstants = {
    SIZE_WIDTH: 1,
    SIZE_HEIGHT: 2,
} as GLConstants;

export function initGLConstants(gl: WebGLRenderingContext): void {
    const glConstants: Partial<GLConstants> = {
        // Размеры
        SIZE_WIDTH: 1,
        SIZE_HEIGHT: 2,

        // Буферы и текстуры
        ARRAY_BUFFER: gl.ARRAY_BUFFER,
        STATIC_DRAW: gl.STATIC_DRAW,
        TEXTURE_2D: gl.TEXTURE_2D,
        TEXTURE0: gl.TEXTURE0,
        TEXTURE_MIN_FILTER: gl.TEXTURE_MIN_FILTER,
        TEXTURE_MAG_FILTER: gl.TEXTURE_MAG_FILTER,
        TEXTURE_WRAP_S: gl.TEXTURE_WRAP_S,
        TEXTURE_WRAP_T: gl.TEXTURE_WRAP_T,
        LINEAR: gl.LINEAR,
        CLAMP_TO_EDGE: gl.CLAMP_TO_EDGE,
        RGBA: gl.RGBA,
        UNSIGNED_BYTE: gl.UNSIGNED_BYTE,

        // FBO
        FRAMEBUFFER: gl.FRAMEBUFFER,
        COLOR_ATTACHMENT0: gl.COLOR_ATTACHMENT0,
        FRAMEBUFFER_COMPLETE: gl.FRAMEBUFFER_COMPLETE,

        // Режимы отрисовки
        POINTS: gl.POINTS,
        TRIANGLES: gl.TRIANGLES,
        TRIANGLE_STRIP: gl.TRIANGLE_STRIP,

        // Блендинг
        BLEND: gl.BLEND,
        SRC_ALPHA: gl.SRC_ALPHA,
        ONE: gl.ONE,
        ONE_MINUS_SRC_ALPHA: gl.ONE_MINUS_SRC_ALPHA,

        // Очистка
        COLOR_BUFFER_BIT: gl.COLOR_BUFFER_BIT,
        DEPTH_BUFFER_BIT: gl.DEPTH_BUFFER_BIT,

        // Ошибки
        NO_ERROR: gl.NO_ERROR,

        // Шейдеры
        VERTEX_SHADER: gl.VERTEX_SHADER,
        FRAGMENT_SHADER: gl.FRAGMENT_SHADER
    };

    Object.keys(glConstants).forEach(key => {
        (constants as any)[key] = (glConstants as any)[key];
    });
}