import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Minus, Percent, ShoppingCart, CreditCard, Banknote, User, Receipt, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useShortcuts } from '@/contexts/ShortcutContext';

interface CartPanelProps {
  onHoldBill: () => void;
  heldBillsCount: number;
  showPayment: boolean;
  setShowPayment: (show: boolean) => void;
  onPrint: () => void;
  onComplete: (method: 'cash' | 'card' | 'credit') => void;
  selectedMethod: 'cash' | 'card' | 'credit' | null;
  onSelectMethod: (method: 'cash' | 'card' | 'credit' | null) => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
  onHoldBill,
  heldBillsCount,
  showPayment,
  setShowPayment,
  onPrint,
  onComplete,
  selectedMethod,
  onSelectMethod
}) => {
  const { items, updateQuantity, updateDiscount, removeItem, subtotal, tax, total, clearCart, itemCount, isReturnMode, originalSaleId } = useCart();
  const { currentUser } = useAuth();
  const { shortcuts } = useShortcuts();
  const { t, i18n } = useTranslation();
  const [cashReceived, setCashReceived] = useState<string>('');

  const balance = selectedMethod === 'cash' ? (parseFloat(cashReceived) || 0) - total : 0;

  const handleFinalize = () => {
    if (selectedMethod === 'cash' && (parseFloat(cashReceived) || 0) < total) {
      toast.error('Insufficient cash received');
      return;
    }

    // Auto-open print if needed or just complete
    onPrint();
    onComplete(selectedMethod || 'cash');
    onSelectMethod(null);
    setCashReceived('');
  };

  if (showPayment && items.length > 0) {
    return (
      <div className="h-full flex flex-col bg-card rounded-2xl border border-border/50 shadow-pos animate-fade-in text-foreground">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                if (selectedMethod) onSelectMethod(null);
                else setShowPayment(false);
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← {selectedMethod ? t('back') : t('back_to_pos')}
            </button>
            <button
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              title="Print Preview (F9)"
              onClick={onPrint}
            >
              <Printer className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <h3 className="text-xl font-bold">{selectedMethod === 'cash' ? 'Cash Payment' : t('pay_now')}</h3>
        </div>

        {/* Total Display */}
        <div className={`p-6 border-b border-border/50 text-center ${isReturnMode ? 'bg-orange-500/5' : 'bg-primary/5'}`}>
          <p className="text-sm text-muted-foreground mb-1">{isReturnMode ? 'Refund Amount' : t('total')}</p>
          <p className={`text-4xl font-bold ${isReturnMode ? 'text-orange-500' : 'text-primary'}`}>Rs. {total.toLocaleString()}</p>
        </div>

        {selectedMethod === 'cash' ? (
          <div className="flex-1 p-6 space-y-6 animate-in slide-in-from-right duration-300">
            {/* Cash Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('cash_received')}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg">Rs.</span>
                <input
                  autoFocus
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFinalize()}
                  className="w-full bg-background border-2 border-primary/20 focus:border-primary rounded-2xl p-4 pl-12 text-2xl font-bold outline-none transition-all shadow-inner"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Balance Card */}
            <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${balance >= 0 ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('balance')}</p>
              <p className={`text-4xl font-black ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                Rs. {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <button
              onClick={handleFinalize}
              className={`w-full py-4 text-primary-foreground rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isReturnMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              <Printer className="w-5 h-5" />
              {isReturnMode ? 'Process Refund' : t('confirm_and_print')}
            </button>
            <p className="text-xs text-center text-muted-foreground lowercase italic">press enter to finalize</p>
          </div>
        ) : (
          /* Payment Method Selection */
          <div className="flex-1 p-4 space-y-3">
            <button
              onClick={() => onSelectMethod('cash')}
              className="w-full p-4 pos-card-hover flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-success" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Cash</p>
                  <p className="text-sm text-muted-foreground">Pay with cash</p>
                </div>
              </div>
              <kbd className="hidden group-hover:block px-2 py-1 bg-background border border-border rounded text-xs font-mono">{shortcuts.cash.label}</kbd>
            </button>

            <button
              onClick={() => {
                onPrint();
                onComplete('card');
              }}
              className="w-full p-4 pos-card-hover flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Card</p>
                  <p className="text-sm text-muted-foreground">Debit or credit card</p>
                </div>
              </div>
              <kbd className="hidden group-hover:block px-2 py-1 bg-background border border-border rounded text-xs font-mono">{shortcuts.card.label}</kbd>
            </button>

            <button
              onClick={() => {
                onPrint();
                onComplete('credit');
              }}
              className="w-full p-4 pos-card-hover flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-warning" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Credit Sale</p>
                  <p className="text-sm text-muted-foreground">Customer account</p>
                </div>
              </div>
              <kbd className="hidden group-hover:block px-2 py-1 bg-background border border-border rounded text-xs font-mono">{shortcuts.credit.label}</kbd>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-2xl border border-border/50 shadow-pos">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('pos_terminal')}</h3>
              <p className="text-xs text-muted-foreground">{itemCount} {t('items')}</p>
            </div>
          </div>
          {currentUser && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Cashier</p>
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
            </div>
          )}
        </div>
        {isReturnMode && (
          <div className="mx-2 mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg animate-pulse">
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider text-center">
              RETURN MODE – Original Bill #{originalSaleId}
            </p>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto scrollbar-thin p-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
            <Receipt className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-center">Cart is empty</p>
            <p className="text-sm text-center mt-1">Add products to start a sale</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-secondary/30 rounded-xl animate-scale-in"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {i18n.language.startsWith('si') && item.product.nameSinhala ? item.product.nameSinhala : item.product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Rs. {item.product.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground whitespace-nowrap">
                    Rs. {((item.product.price * item.quantity) * (1 - item.discount / 100)).toLocaleString()}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-background rounded-lg px-2 py-1">
                    <Percent className="w-3 h-3 text-muted-foreground" />
                    <input
                      type="number"
                      value={item.discount || ''}
                      onChange={(e) => updateDiscount(item.product.id, Number(e.target.value))}
                      className="w-10 bg-transparent text-sm text-center focus:outline-none"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>

                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="ml-auto w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="p-4 border-t border-border/50 bg-secondary/20">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('subtotal')}</span>
            <span className="font-medium text-foreground">Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('tax')} (8%)</span>
            <span className="font-medium text-foreground">Rs. {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t border-border/50">
            <span className="font-semibold text-foreground">{isReturnMode ? 'Refund Total' : t('total')}</span>
            <span className={`font-bold ${isReturnMode ? 'text-orange-500' : 'text-primary'}`}>Rs. {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          {!isReturnMode ? (
            <>
              <button
                onClick={onHoldBill}
                disabled={items.length === 0}
                className="pos-btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center py-1"
              >
                <span>{t('hold')} ({heldBillsCount})</span>
                <span className="text-[10px] opacity-60 font-mono">F2</span>
              </button>
              <button
                onClick={() => setShowPayment(true)}
                disabled={items.length === 0}
                className="pos-btn-success text-sm disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center py-1"
              >
                <span>{t('pay_now')}</span>
                <span className="text-[10px] opacity-60 font-mono">F3</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowPayment(true)}
              disabled={items.length === 0}
              className="col-span-2 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              Confirm Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
