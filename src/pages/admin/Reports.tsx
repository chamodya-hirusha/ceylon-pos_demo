import React, { useMemo } from 'react';
import { generateDemoSales, generateDemoReturns, products, cashiers } from '@/data/demoData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, Calendar, TrendingUp, Users, Package, DollarSign, FileText, RefreshCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '@/contexts/AuthContext';
import { useShop } from '@/contexts/ShopContext';
import {
  generateSalesReportHTML,
  generateInventoryReportHTML,
  generateEmployeePerformanceHTML,
  generateProductPerformanceHTML,
  generateDailySummaryHTML,
  generateReturnReportHTML,
  printHTML
} from '@/utils/reportGenerator';

const COLORS = ['#4DA3FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Reports: React.FC = () => {
  const sales = useMemo(() => generateDemoSales(), []);
  const returns = useMemo(() => generateDemoReturns(sales), [sales]);
  const { userType } = useAuth();
  const { shopDetails } = useShop();

  const exportPDF = async () => {
    const element = document.getElementById('reports-content');
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
    pdf.text(`Business Analytics Report - ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

    pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
    pdf.save(`Business_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      name: month,
      sales: Math.floor(Math.random() * 500000) + 200000,
      profit: Math.floor(Math.random() * 80000) + 30000,
    }));
  }, []);

  const categoryData = useMemo(() => {
    return [
      { name: 'Building', value: 35 },
      { name: 'Electrical', value: 25 },
      { name: 'Plumbing', value: 20 },
      { name: 'Tools', value: 12 },
      { name: 'Other', value: 8 },
    ];
  }, []);

  const cashierPerformance = useMemo(() => {
    return cashiers.map((c) => ({
      name: c.name.split(' ')[0],
      sales: Math.floor(Math.random() * 50) + 20,
      amount: Math.floor(Math.random() * 200000) + 50000,
    }));
  }, []);

  const totalSalesValue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalRefundValue = returns.reduce((sum, r) => sum + r.total, 0);
  const netRevenue = totalSalesValue - totalRefundValue;
  const totalProfit = netRevenue * 0.18;
  const avgSale = sales.length > 0 ? totalSalesValue / sales.length : 0;

  const handlePrintSales = () => {
    const html = generateSalesReportHTML(sales, shopDetails.name || 'Ceylon POS', 'Last 30 Days');
    printHTML(html);
  };

  const handlePrintInventory = () => {
    const html = generateInventoryReportHTML(products, shopDetails.name || 'Ceylon POS');
    printHTML(html);
  };

  const handlePrintEmployee = () => {
    const html = generateEmployeePerformanceHTML(sales, cashiers, shopDetails.name || 'Ceylon POS', 'Last 30 Days');
    printHTML(html);
  };

  const handlePrintProduct = () => {
    const html = generateProductPerformanceHTML(sales, products, shopDetails.name || 'Ceylon POS', 'Last 30 Days');
    printHTML(html);
  };

  const handlePrintDaily = () => {
    const html = generateDailySummaryHTML(sales, shopDetails.name || 'Ceylon POS');
    printHTML(html);
  };

  const handlePrintReturns = () => {
    const html = generateReturnReportHTML(returns, shopDetails.name || 'Ceylon POS', 'Last 30 Days');
    printHTML(html);
  };

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2 lg:mt-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Reports & Analytics</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Detailed business performance insights</p>
        </div>
        <button
          onClick={exportPDF}
          className="pos-btn-primary flex items-center justify-center gap-2 py-3.5 px-6 w-full sm:w-auto"
        >
          <Download className="w-5 h-5" />
          <span className="font-bold">Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-8">
        {[
          { icon: FileText, color: 'text-primary', bg: 'bg-primary/10', title: 'Sales', action: handlePrintSales },
          { icon: Package, color: 'text-success', bg: 'bg-success/10', title: 'Inventory', action: handlePrintInventory },
          { icon: Users, color: 'text-warning', bg: 'bg-warning/10', title: 'Staff', action: handlePrintEmployee },
          { icon: TrendingUp, color: 'text-accent-foreground', bg: 'bg-accent', title: 'Product', action: handlePrintProduct },
          { icon: Calendar, color: 'text-primary', bg: 'bg-primary/10', title: 'Daily', action: handlePrintDaily },
          { icon: RefreshCcw, color: 'text-destructive', bg: 'bg-destructive/10', title: 'Returns', action: handlePrintReturns },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="pos-card p-2 sm:p-3 flex flex-col items-center gap-2 hover:border-primary/50 transition-all active:scale-95"
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${item.bg} flex items-center justify-center`}>
              <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-tighter">{item.title}</span>
          </button>
        ))}
      </div>

      <div id="reports-content">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
          <div className="pos-stat-card p-4 border-l-4 border-l-primary">
            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Total Revenue</p>
            <p className="text-lg lg:text-2xl font-black text-foreground truncate">Rs. {totalSalesValue.toLocaleString()}</p>
          </div>
          <div className="pos-stat-card p-4 border-l-4 border-l-success">
            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Gross Profit</p>
            <p className="text-lg lg:text-2xl font-black text-success truncate">Rs. {totalProfit.toLocaleString()}</p>
          </div>
          <div className="pos-stat-card p-4 border-l-4 border-l-destructive">
            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Total Refunds</p>
            <p className="text-lg lg:text-2xl font-black text-destructive truncate">Rs. {totalRefundValue.toLocaleString()}</p>
          </div>
          <div className="pos-stat-card p-4 border-l-4 border-l-warning">
            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Avg. Sale</p>
            <p className="text-lg lg:text-2xl font-black text-foreground truncate">Rs. {Math.round(avgSale).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="pos-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Monthly Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    formatter={(val: number) => [`Rs. ${val.toLocaleString()}`]}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pos-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Sales by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="pos-card overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground">Staff Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="pos-table text-xs">
              <thead>
                <tr>
                  <th>Cashier</th>
                  <th className="text-center">Total Sales</th>
                  <th className="text-right">Total Amount</th>
                  <th className="text-right">AOV</th>
                </tr>
              </thead>
              <tbody>
                {cashierPerformance.map((c, i) => (
                  <tr key={i}>
                    <td className="font-medium">{c.name}</td>
                    <td className="text-center">{c.sales}</td>
                    <td className="text-right font-semibold">Rs. {c.amount.toLocaleString()}</td>
                    <td className="text-right text-muted-foreground">Rs. {Math.round(c.amount / c.sales).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
