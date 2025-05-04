precision highp float;
varying vec4 vColor;

void main() {
    // Круглая форма частицы
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    // Отбрасываем пиксели за пределами круга
    if (dist > 0.5) discard;
    
    // Плавное затухание к краям
    float alpha = smoothstep(0.5, 0.3, dist);
    
    // Финальный цвет с эффектом свечения
    vec3 color = vColor.rgb + vec3(pow(1.0 - dist, 4.0)) * 0.5;
    gl_FragColor = vec4(color, vColor.a * alpha);
}