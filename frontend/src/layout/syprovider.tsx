import { createContext, useContext, useState, ReactNode } from "react";

interface SYContextType {
    currentSY: string;
    setSY: (newSY: string) => void;
}

const SYContext = createContext < SYContextType | undefined > (undefined);

interface SYProviderProps {
    children: ReactNode;
}

export function SYProvider({ children }: SYProviderProps) {
    const [currentSY, setCurrentSY] = useState < string > ("2025-2026");

    const setSY = (newSY: string) => {
        setCurrentSY(newSY);
        localStorage.setItem("currentSY", newSY);
    };

    return (
        <SYContext.Provider value={{ currentSY, setSY }}>
            {children}
        </SYContext.Provider>
    );
}

export const useSY = (): SYContextType => {
    const context = useContext(SYContext);
    if (!context) {
        throw new Error("useSY must be used within an SYProvider");
    }
    return context;
};
