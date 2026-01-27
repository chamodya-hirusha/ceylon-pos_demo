import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CartItem } from '@/data/demoData';
import { Printer, X } from 'lucide-react';
import { useShop } from '@/contexts/ShopContext';

interface InvoiceModalProps {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    onClose: () => void;
    orderNumber: string;
    cashierName?: string;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
    items,
    subtotal,
    tax,
    total,
    onClose,
    orderNumber,
    cashierName,
}) => {
    const { t, i18n } = useTranslation();
    const { shopDetails } = useShop();
    const date = new Date().toLocaleString(i18n.language);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4 print:p-0 print:bg-white print:static print:inset-auto">
            <div className="bg-card w-full max-w-sm rounded-2xl shadow-pos-lg overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-w-none print:rounded-none print:h-auto print:w-full">
                {/* Actions - Hidden during print */}
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30 print:hidden shrink-0">
                    <h3 className="font-bold text-foreground">Invoice Preview</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 px-4"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="text-xs font-bold">Print Receipt</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="flex-1 overflow-auto p-6 space-y-4 print:p-0 print:overflow-visible receipt-container">
                    <div className="receipt-content mx-auto">
                        {/* Header */}
                        <div className="text-center space-y-1 mb-4">
                            {shopDetails.logo && (
                                <div className="flex justify-center mb-3">
                                    <img src={shopDetails.logo} alt="Logo" className="max-h-16 object-contain grayscale" />
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight leading-none">{shopDetails.name}</h2>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase">{shopDetails.branch}</p>
                            <div className="text-[10px] text-muted-foreground pt-1 border-b border-dashed pb-3 mb-3">
                                <p>{shopDetails.address}</p>
                                <p>{shopDetails.phone} {shopDetails.email && `• ${shopDetails.email}`}</p>
                                {shopDetails.brNo && <p className="mt-1 font-mono uppercase tracking-wider text-[9px]">Reg: {shopDetails.brNo}</p>}
                            </div>
                        </div>

                        <div className="space-y-0.5 text-[11px] mb-4">
                            <div className="flex justify-between">
                                <span className="opacity-70">Invoice No:</span>
                                <span className="font-bold">{orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-70">Date:</span>
                                <span>{date}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed pb-3 mb-3">
                                <div className="flex gap-4">
                                    <span className="opacity-70">Terminal: <span className="text-foreground font-medium">{shopDetails.terminal}</span></span>
                                    {shopDetails.showCashier && (
                                        <span className="opacity-70">Cashier: <span className="text-foreground font-medium uppercase tracking-tight">{cashierName || 'System'}</span></span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-xs border-collapse mb-4">
                            <thead>
                                <tr className="border-b-2 border-primary/20 text-[10px] uppercase">
                                    <th className="text-left py-1.5 font-bold">Item Description</th>
                                    <th className="text-center py-1.5 font-bold px-2">Qty</th>
                                    <th className="text-right py-1.5 font-bold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed divide-border">
                                {items.map((item, idx) => {
                                    const name = i18n.language.startsWith('si') && item.product.nameSinhala
                                        ? item.product.nameSinhala
                                        : item.product.name;
                                    const price = item.product.price * (1 - item.discount / 100);

                                    return (
                                        <tr key={idx} className="align-top">
                                            <td className="py-2 pr-2">
                                                <p className="font-bold text-[11px] leading-tight">{name}</p>
                                                <div className="flex gap-2 text-[9px] opacity-70">
                                                    <span>@{item.product.price.toLocaleString()}</span>
                                                    {item.discount > 0 && <span className="text-success">-{item.discount}%</span>}
                                                </div>
                                            </td>
                                            <td className="text-center py-2 font-medium">{item.quantity}</td>
                                            <td className="text-right py-2 font-bold whitespace-nowrap">{(price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="border-t-2 border-double border-border pt-3 space-y-1 mb-6">
                            <div className="flex justify-between text-[11px]">
                                <span className="opacity-70 uppercase tracking-wider">{t('subtotal')}</span>
                                <span className="font-medium text-foreground">{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="opacity-70 uppercase tracking-wider">{t('tax')} (8%)</span>
                                <span className="font-medium text-foreground">{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-base font-black border-t-2 border-dashed pt-2 mt-2">
                                <span className="uppercase text-primary">TOTAL LKR</span>
                                <span className="text-primary tracking-tight">{total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center pt-6 space-y-2 border-t border-dashed mt-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{shopDetails.receiptFooter}</p>
                            <p className="text-[9px] opacity-60 italic">Scan to verify purchase details</p>
                            <div className="pt-4 flex justify-center opacity-30 grayscale print:opacity-100">
                                {/* Simple Barcode for thermal clear printing */}
                                <div className="h-8 w-40 bg-[repeating-linear-gradient(90deg,black,black_1.5px,transparent_1.5px,transparent_3.5px)]" />
                            </div>
                            <p className="text-[8px] opacity-40 font-mono mt-4 uppercase tracking-[0.3em]">*** end of transaction ***</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          
          body * {
            visibility: hidden;
            background: white !important;
          }

          /* Container to center on page */
          .receipt-container {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            display: flex !important;
            justify-content: center !important;
            padding-top: 20mm;
          }

          .receipt-content {
            visibility: visible !important;
            width: 76mm !important; /* Standard Thermal Width */
            font-family: 'Inconsolata', monospace !important;
            color: black !important;
            background: white !important;
            padding: 5mm;
            border: none;
            margin: 0 auto !important;
            display: block !important;
          }

          .receipt-content * {
            visibility: visible !important;
            color: black !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .border-dashed {
            border-style: dashed !important;
            border-color: #000 !important;
            border-width: 0 0 1pt 0 !important;
          }
          
          .border-t-2 {
            border-top-width: 1.5pt !important;
            border-color: #000 !important;
          }

          .text-primary {
            color: black !important;
          }
          
          img {
            filter: grayscale(1) contrast(2);
          }
        }
      `}</style>
        </div>
    );
};

export default InvoiceModal;
