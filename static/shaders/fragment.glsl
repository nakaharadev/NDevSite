precision highp float;

uniform sampler2D uSampler;
uniform sampler2D uDistortedMask;
uniform sampler2D uParticles;
uniform vec2 uZoomCenter;    // Точка приближения [0..1]
uniform float uZoomLevel;    // Уровень зума (1.0 = нет зума)
uniform float uZoomProgress; // Прогресс анимации [0..1]

uniform float uTime;
varying vec2 vTex;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Шум Перлина (более плавный)
float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);
    
    float res = mix(
        mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
        mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
        u.y
    );
    return res;
}

float animatedNoise(vec2 uv) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 5.0;
    
    for (int i = 0; i < 3; i++) {
        value += amplitude * noise(uv * frequency + uTime * 0.2);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

void main() {
    vec2 texCoord = vTex;
    float zoomAlpha = 1.0;
    if (uZoomProgress > 0.0) {
        // Смещаем координаты относительно центра зума
        texCoord = (texCoord - uZoomCenter) * mix(1.0, uZoomLevel, uZoomProgress) + uZoomCenter;
        
        // Обрезаем текстуру за пределами [0..1]
        if (texCoord.x < 0.0 || texCoord.x > 1.0 || 
            texCoord.y < 0.0 || texCoord.y > 1.0) {
            discard;
        }

        zoomAlpha = 1.0 - uZoomProgress;
    }

    float distortedMask = texture2D(uDistortedMask, texCoord).r;
    
    float speed = 2.0;
    float frequency = 20.0;
    float amplitude = 0.02;
    
    vec2 randomOffset = vec2(
        animatedNoise(texCoord * 2.0),
        animatedNoise(texCoord * 2.0 + 0.5)
    ) * 0.01 * distortedMask;

    vec2 uv = texCoord + randomOffset;
    
    // Дополнительные динамические искажения
    uv += vec2(
        sin(uTime * speed + uv.y * frequency) * amplitude,
        cos(uTime * speed + uv.x * (frequency * 0.8)) * amplitude
    ) * distortedMask;
    
    uv += vec2(sin(uTime * 0.7), cos(uTime * 0.8)) * 0.002 * distortedMask;
    
    vec4 color = texture2D(uSampler, uv);
    color.rgb -= 0.2 * (1.0 - distortedMask);

    vec4 particles = texture2D(uParticles, texCoord);
    
    vec3 result = min(color.rgb + particles.rgb * particles.a, 1.0);
    
    gl_FragColor = vec4(result, zoomAlpha);
}