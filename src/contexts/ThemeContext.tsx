import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = {
    name: string;
    hsl: string;
};

export const themePresets: ThemeColor[] = [
    { name: 'Blue', hsl: '207 100% 65%' },
    { name: 'Green', hsl: '142 76% 45%' },
    { name: 'Purple', hsl: '262 83% 58%' },
    { name: 'Red', hsl: '0 84% 60%' },
    { name: 'Orange', hsl: '24 95% 53%' },
    { name: 'Cyan', hsl: '189 94% 43%' },
    { name: 'Slate', hsl: '215 25% 27%' },
];

export const backgroundPresets: ThemeColor[] = [
    { name: 'White', hsl: '0 0% 100%' },
    { name: 'Gray', hsl: '210 20% 98%' },
    { name: 'Dark', hsl: '215 25% 10%' },
    { name: 'Midnight', hsl: '222 47% 11%' },
];

export const fontPresets: ThemeColor[] = [
    { name: 'Black', hsl: '215 25% 15%' },
    { name: 'Gray', hsl: '215 15% 40%' },
    { name: 'White', hsl: '0 0% 100%' },
];

interface ThemeContextType {
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    fontColor: string;
    setFontColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [primaryColor, setPrimaryColor] = useState(() => {
        return localStorage.getItem('pos-theme-primary') || '207 100% 65%';
    });

    const [backgroundColor, setBackgroundColor] = useState(() => {
        return localStorage.getItem('pos-theme-background') || '210 20% 98%';
    });

    const [fontColor, setFontColor] = useState(() => {
        return localStorage.getItem('pos-theme-font') || '215 25% 15%';
    });

    useEffect(() => {
        const root = document.documentElement;

        // Primary
        root.style.setProperty('--primary', primaryColor);
        root.style.setProperty('--ring', primaryColor);
        root.style.setProperty('--pos-category-active', primaryColor);
        root.style.setProperty('--pos-button-lg', primaryColor);
        root.style.setProperty('--sidebar-primary', primaryColor);
        root.style.setProperty('--sidebar-ring', primaryColor);
        localStorage.setItem('pos-theme-primary', primaryColor);

        // Background
        root.style.setProperty('--background', backgroundColor);
        // Auto-adjust cards for dark backgrounds
        const isDark = backgroundColor.split(' ').some(val => val.includes('%') && parseInt(val) < 20);
        if (isDark) {
            root.style.setProperty('--card', backgroundColor);
            root.style.setProperty('--popover', backgroundColor);
            root.style.setProperty('--secondary', '215 25% 18%');
            root.style.setProperty('--muted', '215 25% 20%');
            root.style.setProperty('--border', '215 25% 20%');
        } else {
            root.style.setProperty('--card', '0 0% 100%');
            root.style.setProperty('--popover', '0 0% 100%');
            root.style.setProperty('--secondary', '210 20% 96%');
            root.style.setProperty('--muted', '210 15% 94%');
            root.style.setProperty('--border', '214 20% 90%');
        }
        localStorage.setItem('pos-theme-background', backgroundColor);

        // Font
        root.style.setProperty('--foreground', fontColor);
        root.style.setProperty('--card-foreground', fontColor);
        root.style.setProperty('--popover-foreground', fontColor);
        localStorage.setItem('pos-theme-font', fontColor);

    }, [primaryColor, backgroundColor, fontColor]);

    return (
        <ThemeContext.Provider value={{
            primaryColor, setPrimaryColor,
            backgroundColor, setBackgroundColor,
            fontColor, setFontColor
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
