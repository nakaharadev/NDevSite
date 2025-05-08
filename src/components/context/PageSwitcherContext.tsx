import React, { createContext, JSX, useContext, useState } from "react";
import { Page } from "../types";

interface PageSwitcherContextValue {
    pages: Page[];
    currentPageId: string;
    setCurrentPageId: (id: string) => void;
}

const PageSwitcherContext = createContext<PageSwitcherContextValue | undefined>(undefined);

export const PageSwitcherProvider: React.FC<{ pages: Page[]; children: JSX.Element }> = ({
    pages, children
}) => {
    const [currentPageId, setCurrentPageId] = useState(pages[0]?.id);

    return (
        <PageSwitcherContext.Provider value={{ pages, currentPageId, setCurrentPageId }}>
            { children }
        </PageSwitcherContext.Provider>
    )
}

export const usePageSwitcher = () => {
    const context = useContext(PageSwitcherContext);
    if (!context)
        throw new Error('usePageSwitcher must be used within a PageSwitcherProvider');

    return context;
  };