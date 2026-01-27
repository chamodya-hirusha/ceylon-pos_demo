import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, CartItem, Sale } from '@/data/demoData';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalDiscount: number;
  tax: number;
  total: number;
  itemCount: number;
  holdCart: () => CartItem[];
  resumeCart: (items: CartItem[]) => void;
  // Return Mode
  isReturnMode: boolean;
  originalSaleId: string | null;
  setReturnMode: (sale: Sale | null) => void;
  originalItems: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08; // 8% tax

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [originalSaleId, setOriginalSaleId] = useState<string | null>(null);
  const [originalItems, setOriginalItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    if (isReturnMode) {
      // In return mode, we only allow items that were in the original sale
      const originalItem = originalItems.find(i => i.product.id === product.id);
      if (!originalItem) {
        return; // Effectively disable adding non-original items
      }
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // Validation for return mode: quantity cannot exceed original
        if (isReturnMode) {
          const originalItem = originalItems.find(i => i.product.id === product.id);
          if (originalItem && existing.quantity + quantity > originalItem.quantity) {
            return prev.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: originalItem.quantity }
                : item
            );
          }
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Check original quantity for new addition in return mode
      if (isReturnMode) {
        const originalItem = originalItems.find(i => i.product.id === product.id);
        if (originalItem && quantity > originalItem.quantity) {
          quantity = originalItem.quantity;
        }
      }

      return [...prev, { product, quantity, discount: 0 }];
    });
  }, [isReturnMode, originalItems]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    if (isReturnMode) {
      const originalItem = originalItems.find(i => i.product.id === productId);
      if (originalItem && quantity > originalItem.quantity) {
        quantity = originalItem.quantity;
      }
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem, isReturnMode, originalItems]);

  const updateDiscount = useCallback((productId: string, discount: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, discount: Math.min(100, Math.max(0, discount)) } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsReturnMode(false);
    setOriginalSaleId(null);
    setOriginalItems([]);
  }, []);

  const holdCart = useCallback(() => {
    const heldItems = [...items];
    clearCart();
    return heldItems;
  }, [items, clearCart]);

  const resumeCart = useCallback((resumeItems: CartItem[]) => {
    setItems(resumeItems);
  }, []);

  const setReturnMode = useCallback((sale: Sale | null) => {
    if (sale) {
      setIsReturnMode(true);
      setOriginalSaleId(sale.id);
      setOriginalItems(sale.items);
      setItems(sale.items.map(item => ({ ...item }))); // Clone items
    } else {
      setIsReturnMode(false);
      setOriginalSaleId(null);
      setOriginalItems([]);
      setItems([]);
    }
  }, []);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    const itemDiscount = itemTotal * (item.discount / 100);
    return sum + (itemTotal - itemDiscount);
  }, 0);

  const totalDiscount = items.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    return sum + (itemTotal * (item.discount / 100));
  }, 0);

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateDiscount,
        clearCart,
        subtotal,
        totalDiscount,
        tax,
        total,
        itemCount,
        holdCart,
        resumeCart,
        isReturnMode,
        originalSaleId,
        setReturnMode,
        originalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
