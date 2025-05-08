import { JSX, useEffect, useRef } from "react";
import * as gl from "../util/gl";
import { constants } from "../util/glConstants";

const PARTICLE_COUNT = 100;

export const HomePage = (): JSX.Element => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stopRenderRef = useRef<() => void>(() => {});
    const hideCallbackRef = useRef<() => void>(() => {});
    
    const zoomAnimationRef = useRef({
        active: false,
        progress: 0,
        speed: 0.03,
        center: [0.5, 0.5] as [number, number],
        targetLevel: 0.05,
        direction: 1.0
    });

    // Вершины и текстуры
    const vertices = new Float32Array([
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
        -1.0,  1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0,  1.0, 0.0,
    ]);

    const texCoords = new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0
    ]);

    // Частицы
    const particleData = new Float32Array(PARTICLE_COUNT * 2);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particleData[i * 2] = Math.random();
        particleData[i * 2 + 1] = Math.random();
    }

    const render = () => {
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

        gl.enableLocation("aRandomSeed");
        gl.drawArrays(constants.POINTS, 0, PARTICLE_COUNT);
        gl.disableLocation("aRandomSeed");

        // 2. Второй проход - композиция
        gl.disableFramebuffer();
        gl.clear(18/255, 18/255, 18/255, 1.0);
        
        gl.useShader("main");

        const zoomAnimation = zoomAnimationRef.current;
        if (zoomAnimation.active) {
            zoomAnimation.progress = Math.min(
                zoomAnimation.progress + zoomAnimation.speed * zoomAnimation.direction, 
                1.0
            );
            
            if (zoomAnimation.progress >= 1.0 || zoomAnimation.progress <= 0.0) {
                zoomAnimation.active = false;
                if (zoomAnimation.progress >= 1.0 && hideCallbackRef.current) {
                    hideCallbackRef.current();
                }
            }
        }
        
        gl.setUniform2f("main", "uZoomCenter", ...zoomAnimation.center);
        gl.setUniform1f("main", "uZoomLevel", zoomAnimation.targetLevel);
        gl.setUniform1f("main", "uZoomProgress", zoomAnimation.progress);

        gl.useTexture(0, "uSampler", "main");
        gl.useTexture(1, "uDistortedMask", "main");
        gl.useFBOTexture(2, "uParticles", "particles", "main");
        gl.setUniform1f("main", "uTime", time);
        
        gl.enableLocation("aPosition");
        gl.enableLocation("aTex");
        gl.drawArrays(constants.TRIANGLES, 0, 6);
        gl.disableLocation("aPosition");
        gl.disableLocation("aTex");
    };

    const createEffects = () => {
        if (!canvasRef.current) return;

        gl.createGLContext(canvasRef.current);

        gl.checkExtension("OES_standard_derivatives");
        gl.checkExtension("ANGLE_instanced_arrays");

        gl.loadShader("main", "/shaders/vertex.glsl", "/shaders/fragment.glsl");
        gl.loadShader("particles", "/shaders/vertexParticles.glsl", "/shaders/fragmentParticles.glsl");

        gl.createStaticBuffer("vertex", vertices);
        gl.createStaticBuffer("texCoords", texCoords);
        gl.createStaticBuffer("random", particleData);

        gl.createFBO("particles", gl.getSize(constants.SIZE_WIDTH), gl.getSize(constants.SIZE_HEIGHT));

        gl.setLocation("vertex", "main", 'aPosition', 3);
        gl.setLocation("texCoords", "main", 'aTex', 2);
        gl.setLocation("random", "particles", "aRandomSeed", 2);

        gl.loadTextures(
            ["uSampler", "uDistortedMask"], 
            ["/images/greeting-bg.png", "/images/greeting-bg-distorted-mask.png"], 
            () => {
                stopRenderRef.current = gl.setDraw(render);
            }
        );
    };

    const stop = () => {
        if (stopRenderRef.current) {
            stopRenderRef.current();
        }
    };

    const start = () => {
        stopRenderRef.current = gl.setDraw(render);
    };

    const hide = (callback: () => void) => {
        zoomAnimationRef.current.active = true;
        zoomAnimationRef.current.direction = 1.0;
        hideCallbackRef.current = callback;
    };

    const show = () => {
        zoomAnimationRef.current.active = true;
        zoomAnimationRef.current.direction = -1.0;
    };

    useEffect(() => {
        createEffects();
        
        return () => {
            stop();
            gl.cleanup();
        };
    }, []);

    return (
        <div style={{
            width: "100vw",
            height: "100vh"
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: '100vw',
                    height: '100vh',
                    display: 'block',
                    zIndex: "-1"
                }}
            />
            <div style={{
                width: "100%",
                height: "100%",
                maxWidth: "1200px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "left",
                justifyContent: "center"
            }}>
                <h1 className="oxanium-700" style={{
                    color: "#fff",
                    fontSize: "61pt",
                    fontWeight: "700",
                    margin: "0",
                    padding: "0"
                }}>NDev</h1>
                <p className="caveat-400" style={{
                    color: "#aaa",
                    fontSize: "21pt",
                    margin: "0",
                    padding: "0"
                }}>Power of dreams</p>
            </div>
        </div>
    );
};