import React, { useCallback, useEffect, useRef, useState } from "react"
import { usePageSwitcher } from "./context/PageSwitcherContext";
import { Page } from "./types";
import { off } from "process";

export const NavBar: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { pages, currentPageId, setCurrentPageId } = usePageSwitcher();
    const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({});
    const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
    const itemsRef = useRef<Record<string, HTMLParagraphElement | null>>({});
    const navRef = useRef<HTMLElement>(null);

    // Функция для обновления позиции линии
    const updateLinePosition = useCallback(() => {
        const currentItem = itemsRef.current[currentPageId];
        if (currentItem && navRef.current) {
            const navRect = navRef.current.getBoundingClientRect();
            const itemRect = currentItem.getBoundingClientRect();
            
            const relativeLeft = itemRect.left - navRect.left;
            
            setLineStyle({
                left: relativeLeft,
                width: itemRect.width
            });
        }
    }, [currentPageId]);

    // Инициализация hover states
    useEffect(() => {
        setHoverStates(pages.reduce((acc, page) => ({ ...acc, [page.id]: false }), {}));
    }, [pages]);

    // Обновление линии при изменении текущей страницы
    useEffect(() => {
        updateLinePosition();
    }, [currentPageId, updateLinePosition]);

    // Обработчик изменения размера окна
    useEffect(() => {
        const handleResize = () => {
            updateLinePosition();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [updateLinePosition]);

    useEffect(() => {
        setHoverStates(pages.reduce((acc, page) => ({ ...acc, [page.id]: false }), {}));
    }, [pages]);

    useEffect(() => {
        const currentItem = itemsRef.current[currentPageId];
        if (currentItem) {
            const { offsetLeft, offsetWidth } = currentItem;

            setLineStyle(prev => ({
                ...prev,
                left: offsetLeft + offsetWidth / 2,
                width: 0
            }));

            const timer = setTimeout(() => {
                setLineStyle({
                    left: offsetLeft,
                    width: offsetWidth
                });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [currentPageId]);

    const handleHover = (pageId: string, isHovered: boolean) => {
        setHoverStates(prev => ({ ...prev, [pageId]: isHovered }));
    };

    return (
        <div style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            marginTop: "15px"
        }}>
            <nav style={{
                display: "flex",
                maxWidth: "1200px",
                width: "100%",
                margin: "0 auto",
                padding: "0 40px",
                alignItems: "center",
                height: "100%",
                position: "relative"
            }}>
                {pages.map((page) => (
                    <p
                        className="alumni-sans-pinstripe-regular"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            color: currentPageId === page.id ? "#00fffa" : hoverStates[page.id] ? "#fff" : "#aaa",
                            fontSize: "27pt",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            margin: "0",
                            marginRight: "20px",
                            transition: "color .2s",
                            height: "100%"
                        }}

                        key={page.id}
                        ref={e1 => { if (e1) itemsRef.current[page.id] = e1; }}
                        onClick={() => setCurrentPageId(page.id)}
                        onMouseEnter={() => handleHover(page.id, true)}
                        onMouseLeave={() => handleHover(page.id, false)}>
                            {page.title}
                    </p>
                ))}

                <div style={{
                    position: "absolute",
                    bottom: "10px",
                    height: "2px",
                    backgroundColor: "#00fffa",
                    left: `${lineStyle.left}px`,
                    width: `${lineStyle.width}px`,
                    top: "40px",
                    transition: "left 0.3s ease-out, width 0.3s ease-out 0.1s",
                    borderRadius: "1px"
                }} />
            </nav>
        </div>
    )
}