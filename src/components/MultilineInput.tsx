import { ChangeEvent, CSSProperties, forwardRef, useImperativeHandle, useRef, useState } from "react";

interface MultilineInputProps {
  hint: string;
  style?: CSSProperties;
}

export type MultilineInputRef = {
  focus: () => void;
  getValue: () => string;
  getNativeElement: () => HTMLTextAreaElement | null;
}

export const MultilineInput = forwardRef<MultilineInputRef, MultilineInputProps>(({ hint, style }, forwardedRef) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [hover, setHover] = useState(false);
    const [focus, setFocus] = useState(false);
    const [hasText, setHasText] = useState(false);

    useImperativeHandle(forwardedRef, () => ({
        focus: () => inputRef.current?.focus(),
        getValue: () => inputRef.current?.value || '',
        getNativeElement: () => inputRef.current
    }));

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setHasText(!!e.target.value);
    };

    return (
        <div style={{
            margin: style?.margin,
            padding: "20px 10px 10px 10px",
            boxSizing: "border-box",
            background: focus || hover ? focus ? "#313233" : "#212223" : "transparent",
            borderRadius: "15px",
            transition: "background .3s, height .3s",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}>
            <textarea 
                style={{
                    position: "relative",
                    color: "#fff",
                    width: "100%",
                    minHeight: "140px",
                    fontSize: "13pt",
                    margin: "0",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    resize: "none",
                    overflow: "hidden",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    lineHeight: '1.5',
                    boxSizing: "border-box",
                    background: "transparent"
                }}
                ref={inputRef}
                onInput={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    handleChange(e);
                }}/>
            <p 
                style={{
                    position: "relative",
                    top: focus || hasText ? "-160px" : "-150px",
                    left: "0px",
                    color: "#ccc",
                    fontSize: focus || hasText ? "10pt" : '15pt',
                    height: "0px",
                    width: "0",
                    margin: "0",
                    transition: "top .3s, font-size .3s",
                    pointerEvents: "none"
                }}>{hint}</p>
        </div>
    );
});