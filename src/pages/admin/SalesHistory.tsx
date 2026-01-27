import React, { useMemo, useState } from 'react';
import { generateDemoSales, generateDemoReturns, Sale } from '@/data/demoData';
import { Search, Calendar, Download, Eye, Receipt, FileText, ShoppingBag, DollarSign, Wallet, CreditCard as CardIcon, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useShop } from '@/contexts/ShopContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import InvoiceModal from '@/components/pos/InvoiceModal';

const SalesHistory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setReturnMode } = useCart();
  const { userType, currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { shopDetails } = useShop();

  const exportPDF = async () => {
    const element = document.getElementById('sales-export-content');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.setFontSize(20);
    pdf.text(shopDetails.name || 'Hardware POS System', 105, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Sales History Report - ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

    pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
    pdf.save(`Sales_History_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [allSales, setAllSales] = useState<Sale[]>([]);

  React.useEffect(() => {
    const demoSales = generateDemoSales();
    const storedSales = localStorage.getItem('simulated_sales');
    let combinedSales = demoSales;

    if (storedSales) {
      const parsedSales = JSON.parse(storedSales).map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp)
      }));
      combinedSales = [...parsedSales, ...demoSales];
    }
    setAllSales(combinedSales);
  }, []);

  const sales = useMemo(() => allSales, [allSales]);
  const returns = useMemo(() => generateDemoReturns(sales), [sales]);

  const [simulatedReturns, setSimulatedReturns] = useState<string[]>([]);

  const location = useLocation();

  React.useEffect(() => {
    const stored = localStorage.getItem('simulated_returns');
    if (stored) {
      setSimulatedReturns(JSON.parse(stored));
    }
  }, [location]);

  // ===== SALES HISTORY STATUS LOGIC =====
  // 1. Display "Returned" status ONLY for invoices that have a completed return record
  // 2. Invoices that have not been returned must NEVER be marked as Returned
  // 3. Do not auto-update or assume return status based on UI actions alone

  // Check if an invoice has been returned
  const isInvoiceReturned = (saleId: string): boolean => {
    // Check if this sale ID is in the simulated_returns list
    // This list contains IDs of invoices that have completed return transactions
    return simulatedReturns.includes(saleId);
  };

  const getReturnStatus = (saleId: string): 'returned' | 'completed' => {
    // Only mark as returned if there's a completed return record
    if (isInvoiceReturned(saleId)) {
      return 'returned';
    }
    return 'completed';
  };

  const filteredSales = useMemo(() => {
    let filtered = sales;

    // Filter by Cashier if user is a cashier
    if (userType === 'cashier' && currentUser) {
      filtered = filtered.filter((s) => s.cashierName === currentUser.name);
    }

    // Date Range Filter
    if (startDate || endDate) {
      filtered = filtered.filter((s) => {
        const saleDate = s.timestamp.toISOString().split('T')[0];
        const isAfterStart = !startDate || saleDate >= startDate;
        const isBeforeEnd = !endDate || saleDate <= endDate;
        return isAfterStart && isBeforeEnd;
      });
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter((s) => s.paymentMethod === paymentFilter);
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
  }, [sales, searchTerm, paymentFilter, startDate, endDate, userType, currentUser]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const currentSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  const totalAmount = filteredSales.reduce((sum, s) => sum + s.total, 0);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentFilter, startDate, endDate]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {userType === 'cashier' && (
            <button
              onClick={() => navigate('/pos')}
              className="p-2 rounded-xl hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">{t('back_to_pos')}</span>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('sales_history')}</h1>
            <p className="text-muted-foreground">{t('sales_transactions')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(userType === 'cashier' ? '/pos/returns' : '/admin/return-history')}
            className="pos-btn-secondary flex items-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            View Returns
          </button>
          <button
            onClick={exportPDF}
            className="pos-btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            {t('export_report')}
          </button>
        </div>
      </div>

      <div id="sales-export-content" className="bg-background p-1">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="pos-stat-card border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">{t('today_orders')}</p>
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{filteredSales.length}</p>
          </div>
          <div className="pos-stat-card border-l-4 border-l-primary/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">{t('total_amount')}</p>
              <DollarSign className="w-4 h-4 text-primary/60" />
            </div>
            <p className="text-2xl font-bold text-primary">Rs. {totalAmount.toLocaleString()}</p>
          </div>
          <div className="pos-stat-card border-l-4 border-l-success">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">{t('cash_sales')}</p>
              <Wallet className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">
              {filteredSales.filter((s) => s.paymentMethod === 'cash').length}
            </p>
          </div>
          <div className="pos-stat-card border-l-4 border-l-accent-foreground">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">{t('card_sales')}</p>
              <CardIcon className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-2xl font-bold text-accent-foreground">
              {filteredSales.filter((s) => s.paymentMethod === 'card').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="pos-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
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

            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pos-input pl-12 w-full md:w-auto"
                  title="Start Date"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pos-input pl-12 w-full md:w-auto"
                  title="End Date"
                />
              </div>
            </div>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="pos-input w-full md:w-48"
            >
              <option value="all">{t('all_payments')}</option>
              <option value="cash">{t('cash')}</option>
              <option value="card">{t('card')}</option>
              <option value="credit">{t('credit')}</option>
            </select>
          </div>
        </div>

        {/* Sales Table */}
        <div className="pos-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>{t('invoice')}</th>
                  <th>{t('date_range')}</th>
                  <th>{t('cashier')}</th>
                  <th>{t('items')}</th>
                  <th>{t('total')}</th>
                  <th>Status</th>
                  <th className="text-right">{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {currentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="font-medium text-foreground font-mono">{sale.id}</td>
                    <td className="text-muted-foreground text-sm">
                      <div>{sale.timestamp.toLocaleDateString(i18n.language)}</div>
                      <div className="text-xs">{sale.timestamp.toLocaleTimeString(i18n.language)}</div>
                    </td>
                    <td className="text-muted-foreground">{sale.cashierName}</td>
                    <td className="text-muted-foreground">{sale.items.length} {t('items')}</td>
                    <td className="font-bold text-foreground">Rs. {sale.total.toLocaleString()}</td>
                    <td>
                      {getReturnStatus(sale.id) === 'returned' ? (
                        <span className="pos-badge bg-destructive/10 text-destructive border-destructive/20 rounded-lg px-2 py-1 text-xs font-medium">
                          Returned
                        </span>
                      ) : (
                        <span className="pos-badge bg-success/10 text-success border-success/20 rounded-lg px-2 py-1 text-xs font-medium">
                          Completed
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`pos-badge text-[10px] ${sale.paymentMethod === 'cash'
                            ? 'pos-badge-success'
                            : sale.paymentMethod === 'card'
                              ? 'pos-badge-primary'
                              : 'pos-badge-warning'
                            }`}
                        >
                          {sale.paymentMethod.toUpperCase()}
                        </span>
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-primary"
                          title="View Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Prevent return if already returned
                            if (isInvoiceReturned(sale.id)) {
                              toast.error('Invoice Already Returned', {
                                description: 'This invoice has already been returned and cannot be returned again.'
                              });
                              return;
                            }
                            setReturnMode(sale);
                            toast.success(`Entering Return Mode for Bill ${sale.id}`);
                            navigate('/pos');
                          }}
                          disabled={isInvoiceReturned(sale.id)}
                          className={`p-2 rounded-lg transition-colors ${isInvoiceReturned(sale.id)
                            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            : 'hover:bg-orange-500/10 text-orange-500'
                            }`}
                          title={isInvoiceReturned(sale.id) ? "Already Returned" : "Return Items"}
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSales.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>{t('no_products_found')}</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
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
          )}
        </div>
      </div>

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

export default SalesHistory;
