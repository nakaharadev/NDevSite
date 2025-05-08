attribute vec3 aPosition;
attribute vec2 aTex;

varying vec2 vTex;

void main() {
    gl_Position = vec4(aPosition, 1.0);
    vTex = vec2(aTex.x, 1.0 - aTex.y);
}