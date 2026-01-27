import React, { useMemo, useState } from 'react';
import { ReturnSale } from '@/data/demoData';
import { Search, Calendar, Download, FileText, ShoppingBag, Receipt, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useShop } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';

const ReturnHistory: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { shopDetails } = useShop();
    const { userType, currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Load actual return transactions from localStorage
    const [allReturns, setAllReturns] = useState<ReturnSale[]>([]);

    React.useEffect(() => {
        const storedReturns = localStorage.getItem('simulated_return_transactions');
        if (storedReturns) {
            const parsedReturns = JSON.parse(storedReturns).map((r: any) => ({
                ...r,
                timestamp: new Date(r.timestamp)
            }));
            setAllReturns(parsedReturns);
        }
    }, [location]);

    const returns = useMemo(() => {
        let filtered = allReturns;

        // Filter by Cashier if user is a cashier
        if (userType === 'cashier' && currentUser) {
            filtered = filtered.filter((r) => r.cashierName === currentUser.name);
        }

        return filtered;
    }, [allReturns, userType, currentUser]);

    const filteredReturns = useMemo(() => {
        let filtered = returns;

        if (startDate || endDate) {
            filtered = filtered.filter((r) => {
                const returnDate = r.timestamp.toISOString().split('T')[0];
                const isAfterStart = !startDate || returnDate >= startDate;
                const isBeforeEnd = !endDate || returnDate <= endDate;
                return isAfterStart && isBeforeEnd;
            });
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.id.toLowerCase().includes(term) ||
                    r.originalSaleId.toLowerCase().includes(term) ||
                    r.cashierName.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [returns, searchTerm, startDate, endDate]);

    const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);

    const currentReturns = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredReturns.slice(start, start + itemsPerPage);
    }, [filteredReturns, currentPage]);

    const totalRefundAmount = filteredReturns.reduce((sum, r) => sum + r.total, 0);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate]);

    const exportPDF = async () => {
        const element = document.getElementById('returns-export-content');
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.setFontSize(20);
        pdf.text(shopDetails.name || 'Ceylon POS', 105, 15, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(`Return History Report - ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

        pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
        pdf.save(`Return_History_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {userType === 'cashier' ? (
                        <button
                            onClick={() => navigate('/pos')}
                            className="p-2 rounded-xl hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium hidden sm:inline">Back to POS</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Return Bills / Credit Notes</h1>
                        <p className="text-muted-foreground">Manage and track all returned transactions</p>
                    </div>
                </div>
                <button
                    onClick={exportPDF}
                    className="pos-btn-secondary flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Export Report
                </button>
            </div>

            <div id="returns-export-content">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="pos-stat-card border-l-4 border-l-orange-500">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground font-medium">Total Returns</p>
                            <ShoppingBag className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{filteredReturns.length}</p>
                    </div>
                    <div className="pos-stat-card border-l-4 border-l-destructive">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground font-medium">Total Refunded</p>
                            <Receipt className="w-4 h-4 text-destructive" />
                        </div>
                        <p className="text-2xl font-bold text-destructive">Rs. {totalRefundAmount.toLocaleString()}</p>
                    </div>
                    <div className="pos-stat-card border-l-4 border-l-primary">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground font-medium">Avg. Refund</p>
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-2xl font-bold text-primary">
                            Rs. {filteredReturns.length > 0 ? (totalRefundAmount / filteredReturns.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="pos-card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by Return ID, Original ID or Cashier..."
                                className="pos-input pl-12"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pos-input w-full md:w-auto"
                            />
                            <span className="text-muted-foreground">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pos-input w-full md:w-auto"
                            />
                        </div>
                    </div>
                </div>

                {/* Returns Table */}
                <div className="pos-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="pos-table">
                            <thead>
                                <tr>
                                    <th>Return ID</th>
                                    <th>Original Bill</th>
                                    <th>Date & Time</th>
                                    <th>Cashier</th>
                                    <th>Items</th>
                                    <th>Refund Amount</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReturns.map((ret) => (
                                    <tr key={ret.id}>
                                        <td className="font-medium text-foreground font-mono">{ret.id}</td>
                                        <td className="text-muted-foreground font-mono">{ret.originalSaleId}</td>
                                        <td className="text-muted-foreground text-sm">
                                            <div>{ret.timestamp.toLocaleDateString()}</div>
                                            <div className="text-xs">{ret.timestamp.toLocaleTimeString()}</div>
                                        </td>
                                        <td className="text-muted-foreground">{ret.cashierName}</td>
                                        <td className="text-muted-foreground">{ret.items.length} items</td>
                                        <td className="font-bold text-destructive">Rs. {ret.total.toLocaleString()}</td>
                                        <td className="text-right">
                                            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-primary">
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredReturns.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>No return transactions found</p>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground order-2 sm:order-1">
                                Showing {currentReturns.length} of {filteredReturns.length} returns
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
        </div>
    );
};

export default ReturnHistory;
