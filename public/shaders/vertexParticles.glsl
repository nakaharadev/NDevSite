attribute vec2 aRandomSeed;  // Случайные значения [0-1]
uniform float uTime;
uniform float uParticleCount;
uniform vec2 uResolution;  // Разрешение экрана

varying vec4 vColor;

void main() {
    // Уникальный ID частицы
    float id = aRandomSeed.x * uParticleCount;
    
    // Начальная позиция (случайная)
    vec2 pos = vec2(
        aRandomSeed.x * 2.0 - 1.0,  // X: [-1, 1]
        aRandomSeed.y * 2.0 - 1.0   // Y: [-1, 1]
    );
    
    // Анимация движения
    float speed = 0.3;
    float angle = id * 6.283;  // 2*PI
    pos.x += sin(uTime * speed + angle) * 0.1;
    pos.y += cos(uTime * speed * 1.3 + angle) * 0.1;
    
    gl_Position = vec4(pos, 0.0, 1.0);
    
    // Динамический размер точки
    gl_PointSize = 10.0 + sin(uTime * 2.0 + id) * 5.0;
    
    // Цвет частицы
    vColor = vec4(
        0.5 + sin(id) * 0.5,
        0.5 + cos(id * 2.0) * 0.5,
        1.0,
        0.8
    );
}