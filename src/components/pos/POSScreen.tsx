import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import { Product, CartItem, ReturnSale } from '@/data/demoData';
import { LogOut, Pause, Play, Clock, Settings, History as HistoryIcon, RefreshCcw, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';
import ShortcutDialog from './ShortcutDialog';
import InvoiceModal from './InvoiceModal';
import { useShortcuts, matchesShortcut } from '@/contexts/ShortcutContext';

const POSScreen: React.FC = () => {
  const { currentUser, logout, userType } = useAuth();
  const { addItem, holdCart, resumeCart, items, updateQuantity, isReturnMode, originalSaleId, setReturnMode, originalItems, subtotal, tax, total, clearCart, updateDiscount } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [heldBills, setHeldBills] = useState<{ items: CartItem[]; time: Date }[]>([]);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit' | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSaleSnapshot, setLastSaleSnapshot] = useState<{ items: CartItem[]; subtotal: number; tax: number; total: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { shortcuts } = useShortcuts();
  
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 - Search
      if (matchesShortcut(e, shortcuts.search)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      // F2 - Hold bill
      if (matchesShortcut(e, shortcuts.hold)) {
        e.preventDefault();
        handleHoldBill();
      }
      // F3 - Pay
      if (matchesShortcut(e, shortcuts.pay)) {
        e.preventDefault();
        if (items.length > 0) setShowPayment(true);
      }
      // F4 - Held bills
      if (matchesShortcut(e, shortcuts.held_bills)) {
        e.preventDefault();
        setShowHeldBills(true);
      }
      // Shift + H - History
      if (matchesShortcut(e, shortcuts.history)) {
        e.preventDefault();
        navigate('/pos/history');
      }

      // Payment Methods (only when showPayment is true)
      if (showPayment) {
        if (matchesShortcut(e, shortcuts.cash)) setPaymentMethod('cash');
        if (matchesShortcut(e, shortcuts.card)) {
          onCompleteSale('card');
          setShowInvoice(true);
        }
        if (matchesShortcut(e, shortcuts.credit)) {
          onCompleteSale('credit');
          setShowInvoice(true);
        }
      }

      // F10 - Logout
      if (matchesShortcut(e, shortcuts.logout)) {
        e.preventDefault();
        handleLogout();
      }
      // Alt + C - Clear cart
      if (matchesShortcut(e, shortcuts.clear_cart)) {
        e.preventDefault();
        if (items.length > 0) {
          clearCart();
          toast.info(t('clear_cart'));
        }
      }

      // F8 - Discount for last item
      if (matchesShortcut(e, shortcuts.discount)) {
        e.preventDefault();
        if (items.length > 0) {
          const lastItem = items[items.length - 1];
          const currentDiscount = lastItem.discount;
          const newDiscount = window.prompt(`${t('discount')} % for ${lastItem.product.name}:`, currentDiscount.toString());
          if (newDiscount !== null) {
            const val = parseFloat(newDiscount);
            if (!isNaN(val) && val >= 0 && val <= 100) {
              updateDiscount(lastItem.product.id, val);
              toast.success(`Discount updated to ${val}%`);
            }
          }
        }
      }

      // F9 - Print/View Invoice
      if (matchesShortcut(e, shortcuts.print)) {
        e.preventDefault();
        if (items.length > 0) setShowInvoice(true);
      }

      // + / = (Increase Quantity)
      if ((e.key === '+' || e.key === '=') && !e.ctrlKey && !e.altKey) {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          if (items.length > 0) {
            const lastItem = items[items.length - 1];
            updateQuantity(lastItem.product.id, lastItem.quantity + 1);
          }
        }
      }

      // - (Decrease Quantity)
      if (e.key === '-' && !e.ctrlKey && !e.altKey) {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          if (items.length > 0) {
            const lastItem = items[items.length - 1];
            updateQuantity(lastItem.product.id, lastItem.quantity - 1);
          }
        }
      }

      // Escape - Close all overlays or blur
      if (e.key === 'Escape') {
        if (showPayment) setShowPayment(false);
        else if (showHeldBills) setShowHeldBills(false);
        else if (showShortcuts) setShowShortcuts(false);
        else if (showInvoice) setShowInvoice(false);
        else (document.activeElement as HTMLElement)?.blur();
      }

      // Enter to close invoice if open
      if (e.key === 'Enter' && showInvoice) {
        e.preventDefault();
        setShowInvoice(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, showPayment, showHeldBills, showShortcuts]);

  const handleProductSelect = (product: Product) => {
    if (isReturnMode) {
      const originalItem = originalItems.find(i => i.product.id === product.id);
      if (!originalItem) {
        toast.error('Cannot add this item in Return Mode', {
          description: 'Only items from the original invoice can be returned.'
        });
        return;
      }
    }

    addItem(product);
    const productName = i18n.language.startsWith('si') && product.nameSinhala ? product.nameSinhala : product.name;

    if (isReturnMode) {
      toast.success(`Added to Return: ${productName}`, { duration: 1500 });
    } else {
      toast.success(t('added_to_cart', { name: productName }), { duration: 1500 });
    }
  };

  const handleHoldBill = () => {
    if (items.length === 0) return;
    const heldItems = holdCart();
    setHeldBills([...heldBills, { items: heldItems, time: new Date() }]);
    toast.info(t('bill_held'), { description: 'You can resume it anytime' });
  };

  const handleResumeBill = (index: number) => {
    const bill = heldBills[index];
    resumeCart(bill.items);
    setHeldBills(heldBills.filter((_, i) => i !== index));
    setShowHeldBills(false);
    toast.success(t('bill_resumed'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const onCompleteSale = (method: 'cash' | 'card' | 'credit') => {
    setLastSaleSnapshot({ items: [...items], subtotal, tax, total });

    if (isReturnMode) {
      const returnRecord: ReturnSale = {
        id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
        originalSaleId: originalSaleId!,
        items: [...items],
        subtotal,
        tax,
        total,
        cashierId: currentUser?.id || 'C001',
        cashierName: currentUser?.name || 'Cashier',
        timestamp: new Date(),
        reason: 'Customer Return'
      };

      const existingReturnTransactions = JSON.parse(localStorage.getItem('simulated_return_transactions') || '[]');
      localStorage.setItem('simulated_return_transactions', JSON.stringify([...existingReturnTransactions, returnRecord]));

      const existingReturns = JSON.parse(localStorage.getItem('simulated_returns') || '[]');
      if (originalSaleId && !existingReturns.includes(originalSaleId)) {
        localStorage.setItem('simulated_returns', JSON.stringify([...existingReturns, originalSaleId]));
      }

      const currentInventory = JSON.parse(localStorage.getItem('simulated_inventory') || '{}');
      items.forEach(item => {
        const currentStock = currentInventory[item.product.id] ?? item.product.stock;
        currentInventory[item.product.id] = currentStock + item.quantity;
      });
      localStorage.setItem('simulated_inventory', JSON.stringify(currentInventory));

      toast.success(`Return Processed Successfully!`, {
        description: `Refund Issued: Rs. ${total.toLocaleString()}`,
      });
    } else {
      toast.success(`Sale completed! Total: Rs. ${total.toLocaleString()}`, {
        description: `Payment method: ${method.toUpperCase()}`,
      });

      const newSale = {
        id: `SALE-${Math.floor(10000 + Math.random() * 90000)}`,
        items: [...items],
        subtotal,
        discount: 0,
        tax,
        total,
        paymentMethod: method,
        cashierId: currentUser?.id || 'C001',
        cashierName: currentUser?.name || 'Cashier',
        timestamp: new Date().toISOString(),
      };

      const existingSales = JSON.parse(localStorage.getItem('simulated_sales') || '[]');
      localStorage.setItem('simulated_sales', JSON.stringify([newSale, ...existingSales]));
    }

    clearCart();
    setShowPayment(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border/50 px-3 sm:px-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
              H
            </div>
            <div className="hidden xs:block overflow-hidden">
              <h1 className="font-bold text-foreground text-sm sm:text-base truncate">{t('app_name')}</h1>
              <p className="text-[10px] text-muted-foreground truncate">
                {currentUser?.name || 'Cashier'}
              </p>
            </div>
          </div>
          {isReturnMode && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-orange-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl animate-pulse shadow-lg shadow-orange-500/20 shrink-0">
              <RefreshCcw className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <div className="leading-tight hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-tighter">Return Mode</p>
                <p className="text-[10px] opacity-90 font-mono">#{originalSaleId}</p>
              </div>
              <button
                onClick={() => setReturnMode(null)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors"
                title="Cancel Return Mode"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-medium text-foreground">
              {currentTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {currentTime.toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>

          <LanguageToggle />

          <button
            onClick={() => setShowShortcuts(true)}
            className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <kbd className="px-1.5 py-0.5 bg-background rounded text-foreground font-mono">{shortcuts.search.label}</kbd>
            <span>- Search</span>
            <kbd className="px-1.5 py-0.5 bg-background rounded text-foreground font-mono ml-1">{shortcuts.pay.label}</kbd>
            <span>- Pay</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => navigate('/pos/history')}
              className="p-2 rounded-lg sm:rounded-xl hover:bg-muted transition-colors"
              title={t('sales_history') + ` (${shortcuts.history.label})`}
            >
              <HistoryIcon className="w-5 h-5 text-muted-foreground" />
            </button>

            {userType === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-lg sm:rounded-xl hover:bg-muted transition-colors"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm font-medium">{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden flex border-b border-border bg-card shrink-0">
        <button
          onClick={() => setMobileView('products')}
          className={`flex-1 py-3 font-bold text-sm transition-all border-b-2 ${mobileView === 'products' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
        >
          {t('products')}
        </button>
        <button
          onClick={() => setMobileView('cart')}
          className={`flex-1 py-3 font-bold text-sm transition-all border-b-2 relative ${mobileView === 'cart' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
        >
          {t('cart')}
          {items.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full">
              {items.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-4 gap-2 sm:gap-4 relative">
        <div className={`flex-1 min-w-0 h-full ${mobileView === 'products' ? 'block' : 'hidden lg:block'}`}>
          <ProductGrid onProductSelect={handleProductSelect} />
        </div>

        <div className={`w-full lg:max-w-md h-full ${mobileView === 'cart' ? 'block' : 'hidden lg:block'}`}>
          <CartPanel
            onHoldBill={handleHoldBill}
            heldBillsCount={heldBills.length}
            showPayment={showPayment}
            setShowPayment={(show) => {
              setShowPayment(show);
              if (!show) setPaymentMethod(null);
            }}
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            onPrint={() => items.length > 0 && setShowInvoice(true)}
            onComplete={onCompleteSale}
          />
        </div>
      </div>

      {/* Overlays */}
      {showHeldBills && heldBills.length > 0 && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-card rounded-2xl shadow-pos-lg w-full max-w-md m-4 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Held Bills</h3>
              <button onClick={() => setShowHeldBills(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">✕</button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-auto">
              {heldBills.map((bill, index) => (
                <button key={index} onClick={() => handleResumeBill(index)} className="w-full p-4 pos-card-hover flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Pause className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{bill.items.length} items</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{bill.time.toLocaleTimeString()}</p>
                  </div>
                  <Play className="w-5 h-5 text-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showShortcuts && <ShortcutDialog onClose={() => setShowShortcuts(false)} />}

      {showInvoice && lastSaleSnapshot && (
        <InvoiceModal
          items={lastSaleSnapshot.items}
          subtotal={lastSaleSnapshot.subtotal}
          tax={lastSaleSnapshot.tax}
          total={lastSaleSnapshot.total}
          onClose={() => setShowInvoice(false)}
          orderNumber={`INV-${Math.floor(1000 + Math.random() * 9000)}`}
          cashierName={currentUser?.name}
        />
      )}

      {heldBills.length > 0 && !showHeldBills && (
        <button
          onClick={() => setShowHeldBills(true)}
          className="fixed bottom-20 lg:bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-warning text-warning-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all animate-fade-in z-40"
        >
          <Pause className="w-5 h-5" />
          <span className="font-semibold hidden sm:inline">{heldBills.length} {t('hold')}</span>
          <span className="text-[10px] opacity-60 font-mono ml-1 hidden sm:inline">F4</span>
        </button>
      )}
    </div>
  );
};

export default POSScreen;
