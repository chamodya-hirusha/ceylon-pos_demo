import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import { Product, CartItem } from '@/data/demoData';
import { LogOut, Pause, Play, Clock, Settings, History as HistoryIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';
import ShortcutDialog from './ShortcutDialog';
import { Keyboard, Printer } from 'lucide-react';
import InvoiceModal from './InvoiceModal';
import { useShortcuts, matchesShortcut } from '@/contexts/ShortcutContext';

const POSScreen: React.FC = () => {
  const { currentUser, logout, userType } = useAuth();
  const { addItem, holdCart, resumeCart, items, updateQuantity } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [heldBills, setHeldBills] = useState<{ items: CartItem[]; time: Date }[]>([]);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'credit' | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSaleSnapshot, setLastSaleSnapshot] = useState<{ items: CartItem[]; subtotal: number; tax: number; total: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { subtotal, tax, total, clearCart, updateDiscount } = useCart();
  const { shortcuts } = useShortcuts();

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
        if (matchesShortcut(e, shortcuts.cash)) setSelectedMethod('cash');
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
        // Check if we are not in an input field
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
    addItem(product);
    const productName = i18n.language.startsWith('si') && product.nameSinhala ? product.nameSinhala : product.name;
    toast.success(t('added_to_cart', { name: productName }), { duration: 1500 });
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
    // Take snapshot for invoice
    setLastSaleSnapshot({ items: [...items], subtotal, tax, total });

    toast.success(`Sale completed! Total: Rs. ${total.toLocaleString()}`, {
      description: `Payment method: ${method.toUpperCase()}`,
    });
    clearCart();
    setShowPayment(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border/50 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
              H
            </div>
            <div>
              <h1 className="font-bold text-foreground">{t('app_name')}</h1>
              <p className="text-xs text-muted-foreground">
                {currentUser?.name || 'Cashier'} • Session Active
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Time display */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {currentTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {currentTime.toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>

          <LanguageToggle />

          {/* Keyboard shortcuts hint */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <kbd className="px-1.5 py-0.5 bg-background rounded text-foreground font-mono">{shortcuts.search.label}</kbd>
            <span>- Search</span>
            <kbd className="px-1.5 py-0.5 bg-background rounded text-foreground font-mono ml-1">{shortcuts.pay.label}</kbd>
            <span>- Pay</span>
          </button>

          {/* History Button */}
          <button
            onClick={() => navigate('/pos/history')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            title={t('sales_history') + ` (${shortcuts.history.label})`}
          >
            <HistoryIcon className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Actions */}
          {userType === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Products Section */}
        <div className="flex-1 min-w-0">
          <ProductGrid onProductSelect={handleProductSelect} />
        </div>

        {/* Cart Section */}
        <div className="w-full max-w-md">
          <CartPanel
            onHoldBill={handleHoldBill}
            heldBillsCount={heldBills.length}
            showPayment={showPayment}
            setShowPayment={(show) => {
              setShowPayment(show);
              if (!show) setSelectedMethod(null);
            }}
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            onPrint={() => items.length > 0 && setShowInvoice(true)}
            onCompleteSale={onCompleteSale}
          />
        </div>
      </div>

      {/* Held Bills Overlay */}
      {showHeldBills && heldBills.length > 0 && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card rounded-2xl shadow-pos-lg w-full max-w-md m-4 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Held Bills</h3>
              <button
                onClick={() => setShowHeldBills(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-auto">
              {heldBills.map((bill, index) => (
                <button
                  key={index}
                  onClick={() => handleResumeBill(index)}
                  className="w-full p-4 pos-card-hover flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Pause className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">
                      {bill.items.length} items
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {bill.time.toLocaleTimeString()}
                    </p>
                  </div>
                  <Play className="w-5 h-5 text-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shortcut Dialog */}
      {showShortcuts && (
        <ShortcutDialog onClose={() => setShowShortcuts(false)} />
      )}

      {/* Invoice Modal */}
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

      {/* Floating Held Bills Button */}
      {heldBills.length > 0 && !showHeldBills && (
        <button
          onClick={() => setShowHeldBills(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-warning text-warning-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all animate-fade-in"
        >
          <Pause className="w-5 h-5" />
          <span className="font-semibold">{heldBills.length} {t('hold')}</span>
          <span className="text-[10px] opacity-60 font-mono ml-1">F4</span>
        </button>
      )}
    </div>
  );
};

export default POSScreen;
