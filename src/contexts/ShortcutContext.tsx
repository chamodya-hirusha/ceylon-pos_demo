import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ShortcutConfig {
    key: string;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    label: string;
}

export interface ShortcutMap {
    [action: string]: ShortcutConfig;
}

const DEFAULT_SHORTCUTS: ShortcutMap = {
    search: { key: 'f1', ctrl: false, shift: false, alt: false, label: 'F1' },
    hold: { key: 'f2', ctrl: false, shift: false, alt: false, label: 'F2' },
    pay: { key: 'f3', ctrl: false, shift: false, alt: false, label: 'F3' },
    held_bills: { key: 'f4', ctrl: false, shift: false, alt: false, label: 'F4' },
    history: { key: 'h', ctrl: false, shift: true, alt: false, label: 'Shift + H' },
    clear_cart: { key: 'c', ctrl: false, shift: false, alt: true, label: 'Alt + C' },
    discount: { key: 'f8', ctrl: false, shift: false, alt: false, label: 'F8' },
    print: { key: 'f9', ctrl: false, shift: false, alt: false, label: 'F9' },
    logout: { key: 'f10', ctrl: false, shift: false, alt: false, label: 'F10' },
    cash: { key: '1', ctrl: false, shift: true, alt: false, label: 'Shift + 1' },
    card: { key: '2', ctrl: false, shift: true, alt: false, label: 'Shift + 2' },
    credit: { key: '3', ctrl: false, shift: true, alt: false, label: 'Shift + 3' },
};

interface ShortcutContextType {
    shortcuts: ShortcutMap;
    updateShortcut: (action: string, config: ShortcutConfig) => void;
    resetShortcuts: () => void;
}

const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, userType } = useAuth();
    const userId = userType === 'admin' ? 'admin' : currentUser?.id || 'guest';
    const storageKey = `shortcuts_${userId}`;

    const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS);

    // Load from localStorage on user change
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setShortcuts(JSON.parse(saved));
            } catch (e) {
                setShortcuts(DEFAULT_SHORTCUTS);
            }
        } else {
            setShortcuts(DEFAULT_SHORTCUTS);
        }
    }, [storageKey]);

    const updateShortcut = (action: string, config: ShortcutConfig) => {
        const newShortcuts = { ...shortcuts, [action]: config };
        setShortcuts(newShortcuts);
        localStorage.setItem(storageKey, JSON.stringify(newShortcuts));
    };

    const resetShortcuts = () => {
        setShortcuts(DEFAULT_SHORTCUTS);
        localStorage.removeItem(storageKey);
    };

    return (
        <ShortcutContext.Provider value={{ shortcuts, updateShortcut, resetShortcuts }}>
            {children}
        </ShortcutContext.Provider>
    );
};

export const useShortcuts = () => {
    const context = useContext(ShortcutContext);
    if (!context) throw new Error('useShortcuts must be used within ShortcutProvider');
    return context;
};

// Helper to check if a KeyboardEvent matches a config
export const matchesShortcut = (e: KeyboardEvent, config: ShortcutConfig) => {
    return (
        e.key.toLowerCase() === config.key.toLowerCase() &&
        e.ctrlKey === config.ctrl &&
        e.shiftKey === config.shift &&
        e.altKey === config.alt
    );
};
