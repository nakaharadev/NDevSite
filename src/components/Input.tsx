import React, { useState, useEffect, useRef, CSSProperties } from 'react';

interface InputProps {
  hint: string;
}

export const Input: React.FC<InputProps> = ({ hint }) => {
    const [focus, setFocus] = useState(false);
    const [hover, setHover] = useState(false);
    const [hasText, setHasText] = useState(false);
    const ref = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasText(!!e.target.value);
    }

    useEffect(() => {
            if (!ref.current) return;
        
            const current = ref.current;
            const startHeight = 30;
            const endHeight = 40;
            const duration = 300;
            let startTime: number | null = null;
        
            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentHeight = focus || hasText
                    ? startHeight + (endHeight - startHeight) * progress
                    : endHeight - (endHeight - startHeight) * progress;
                
                current.style.height = `${currentHeight}px`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
        
            requestAnimationFrame(animate);
        }, [focus, hasText]);

    return (
        <div>
            <input
            ref={ref}
            style={{
                position: "relative",
                top: "20px",
                color: "#fff",
                width: "100%",
                height: focus ? "40px" : "30px",
                background: focus ? "#313233" : "transparent",
                padding: "10px",
                fontSize: "15pt",
                margin: "0",
                borderRadius: "15px",
                transition: "background .3s, height .3s",
                border: "none",
                outline: "none",
                cursor: "pointer",
            }}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onChange={handleChange}/>
            <p style={{
                position: "relative",
                top: focus || hasText ? "-40px" : "-30px",
                left: "11px",
                color: "#ccc",
                fontSize: focus || hasText ? "10pt" : '15pt',
                height: "0px",
                margin: "0",
                transition: "top .3s, font-size .3s"
            }}
            onBlur={() => setFocus(false)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => {
                setFocus(true);
                ref.current?.focus();
            }}>{ hint }</p>
        </div>
    )
};