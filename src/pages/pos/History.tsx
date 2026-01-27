import React, { useMemo, useState, useEffect } from 'react';
import { generateDemoSales, Sale } from '@/data/demoData';
import { Search, Calendar, Receipt, FileText, ArrowLeft, Printer, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import InvoiceModal from '@/components/pos/InvoiceModal';

const CashierHistory: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Backspace - Back to POS
            if (e.key === 'Backspace' && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                navigate('/pos');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    const sales = useMemo(() => generateDemoSales(), []);

    const filteredSales = useMemo(() => {
        let filtered = sales;

        // Daily Filter
        if (selectedDate) {
            filtered = filtered.filter(
                (s) => s.timestamp.toISOString().split('T')[0] === selectedDate
            );
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (s) =>
                    s.id.toLowerCase().includes(term) ||
                    s.cashierName.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [sales, searchTerm, selectedDate]);

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

    const currentSales = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSales.slice(start, start + itemsPerPage);
    }, [filteredSales, currentPage]);

    const totalAmount = filteredSales.reduce((sum, s) => sum + s.total, 0);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedDate]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="h-16 bg-card border-b border-border/50 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/pos')}
                        className="p-2 rounded-xl hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        title="Backspace"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium hidden sm:inline">{t('back_to_pos')}</span>
                    </button>
                    <div className="h-6 w-px bg-border/50 mx-2 hidden sm:block" />
                    <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        {t('sales_history')}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary">{filteredSales.length} {t('items')}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
                        <span className="text-sm font-bold text-success">Rs. {totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6">
                {/* Filters */}
                <div className="pos-card p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('search_invoice')}
                                className="pos-input pl-12"
                            />
                        </div>

                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pos-input pl-12 w-full md:w-auto"
                            />
                        </div>
                    </div>
                </div>

                {/* Table/List */}
                <div className="pos-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="pos-table">
                            <thead>
                                <tr>
                                    <th>{t('invoice')}</th>
                                    <th>{t('date_range')}</th>
                                    <th>{t('total')}</th>
                                    <th className="text-right">{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="font-mono font-medium">{sale.id}</td>
                                        <td>
                                            <div className="text-sm text-foreground">{sale.timestamp.toLocaleDateString(i18n.language)}</div>
                                            <div className="text-xs text-muted-foreground">{sale.timestamp.toLocaleTimeString(i18n.language)}</div>
                                        </td>
                                        <td className="font-bold text-primary">Rs. {sale.total.toLocaleString()}</td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedSale(sale)}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-semibold"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    {t('view')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredSales.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-border">
                                <Receipt className="w-10 h-10 text-muted-foreground opacity-30" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">{t('no_products_found')}</h3>
                            <p className="text-muted-foreground">{t('search_products')}</p>
                        </div>
                    ) : (
                        /* Pagination Controls */
                        totalPages > 1 && (
                            <div className="p-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-muted-foreground order-2 sm:order-1">
                                    {t('showing_sales', {
                                        count: currentSales.length,
                                        total: filteredSales.length
                                    })}
                                </p>
                                <div className="flex items-center gap-2 order-1 sm:order-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="pos-btn-secondary py-2 px-4 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-xl font-medium transition-all ${currentPage === page
                                                        ? 'bg-primary text-primary-foreground shadow-lg active:scale-95'
                                                        : 'hover:bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="pos-btn-secondary py-2 px-4 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </main>

            {/* Invoice Detail Modal */}
            {selectedSale && (
                <InvoiceModal
                    items={selectedSale.items}
                    subtotal={selectedSale.subtotal}
                    tax={selectedSale.tax}
                    total={selectedSale.total}
                    onClose={() => setSelectedSale(null)}
                    orderNumber={selectedSale.id}
                    cashierName={selectedSale.cashierName}
                />
            )}
        </div>
    );
};

export default CashierHistory;
