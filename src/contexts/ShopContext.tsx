import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ShopDetails {
    name: string;
    branch: string;
    address: string;
    phone: string;
    email: string;
    brNo: string;
    terminal: string;
    showCashier: boolean;
    logo: string | null;
    receiptFooter: string;
}

interface ShopContextType {
    shopDetails: ShopDetails;
    setShopDetails: React.Dispatch<React.SetStateAction<ShopDetails>>;
}

const defaultShop: ShopDetails = {
    name: 'Ceylon Hardware POS',
    branch: 'Colombo-07 Branch',
    address: '45, Alexandra Place, Colombo 00700, Sri Lanka',
    phone: '+94 11 234 5678',
    email: 'sales@ceylonhardware.lk',
    brNo: 'PV-123456-ABC',
    terminal: 'T-001',
    showCashier: true,
    logo: null,
    receiptFooter: 'Thank you for choosing Ceylon Hardware! Visit us again.'
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [shopDetails, setShopDetails] = useState<ShopDetails>(() => {
        const saved = localStorage.getItem('pos-shop-details');
        return saved ? JSON.parse(saved) : defaultShop;
    });

    useEffect(() => {
        localStorage.setItem('pos-shop-details', JSON.stringify(shopDetails));
    }, [shopDetails]);

    return (
        <ShopContext.Provider value={{ shopDetails, setShopDetails }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
