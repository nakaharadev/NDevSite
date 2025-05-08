import { useEffect, useRef } from "react";
import { usePageSwitcher } from "./context/PageSwitcherContext"

interface PageSwitcherProps {}

export const PageSwitcher: React.FC<PageSwitcherProps> = () => {
    const { pages, currentPageId } = usePageSwitcher();

    const pageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

    // 2. Функция прокрутки
    const scrollToCurrentPage = () => {
        const currentRef = pageRefs.current[currentPageId];
        
        if (currentRef) {
        currentRef.scrollIntoView();
        } else {
            console.warn(`Element with id ${currentPageId} not found`);
        }
    };

    // 3. Вызываем при монтировании и изменении currentPageId
    useEffect(() => {
        scrollToCurrentPage();
    }, [currentPageId]);

    return (
        <div className="page-switcher-container">
            {pages.map((page) => (
                <div 
                    key={page.id}
                    ref={el => { pageRefs.current[page.id] = el }}
                >
                {page.component}
              </div>
            ))}
            
        </div>
    )
}