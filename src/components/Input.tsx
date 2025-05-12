import React, { 
  useState, 
  useEffect, 
  useRef, 
  CSSProperties, 
  forwardRef,
  useImperativeHandle
} from 'react';

interface InputProps {
  hint: string;
  style?: CSSProperties;
}

export type InputRef = {
  focus: () => void;
  getValue: () => string;
  getNativeElement: () => HTMLInputElement | null;
}

export const Input = forwardRef<InputRef, InputProps>(({ hint, style = {} }, forwardedRef) => {
    const [focus, setFocus] = useState(false);
    const [hover, setHover] = useState(false);
    const [hasText, setHasText] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Предоставляем методы наружу через useImperativeHandle
    useImperativeHandle(forwardedRef, () => ({
      focus: () => inputRef.current?.focus(),
      getValue: () => inputRef.current?.value || '',
      getNativeElement: () => inputRef.current
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasText(!!e.target.value);
    };

    return (
        <div style={{ margin: style?.margin }}>
            <input
                ref={inputRef}
                style={{
                    position: "relative",
                    color: "#fff",
                    width: "100%",
                    height: focus || hasText ? "40px" : "30px",
                    background: focus || hover ? focus ? "#313233" : "#212223" : "transparent",
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
                onChange={handleChange}
            />
            <p 
                style={{
                    position: "relative",
                    top: focus || hasText ? "-60px" : "-40px",
                    left: "11px",
                    color: "#ccc",
                    fontSize: focus || hasText ? "10pt" : '15pt',
                    height: "0px",
                    width: "0",
                    margin: "0",
                    transition: "top .3s, font-size .3s",
                    cursor: "pointer"
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={() => {
                    setFocus(true);
                    inputRef.current?.focus();
                }}
            >
                {hint}
            </p>
        </div>
    );
});

Input.displayName = 'Input';