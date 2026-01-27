import React, { useMemo } from 'react';
import { generateDemoSales, products, cashiers } from '@/data/demoData';
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
  LineChart,
  Line,
} from 'recharts';
import { Download, Calendar, TrendingUp, Users, Package, DollarSign, FileText } from 'lucide-react';
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
  printHTML
} from '@/utils/reportGenerator';

const COLORS = ['#4DA3FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Reports: React.FC = () => {
  const sales = useMemo(() => generateDemoSales(), []);
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

  // Calculate report data
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      name: month,
      sales: Math.floor(Math.random() * 500000) + 200000,
      profit: Math.floor(Math.random() * 80000) + 30000,
    }));
  }, []);

  const categoryData = useMemo(() => {
    const data = [
      { name: 'Building', value: 35 },
      { name: 'Electrical', value: 25 },
      { name: 'Plumbing', value: 20 },
      { name: 'Tools', value: 12 },
      { name: 'Other', value: 8 },
    ];
    return data;
  }, []);

  const cashierPerformance = useMemo(() => {
    return cashiers.map((c) => ({
      name: c.name.split(' ')[0],
      sales: Math.floor(Math.random() * 50) + 20,
      amount: Math.floor(Math.random() * 200000) + 50000,
    }));
  }, []);

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalProfit = totalSales * 0.18;
  const avgSale = totalSales / sales.length;

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">View detailed business insights</p>
        </div>
        <div className="flex gap-2">
          <button className="pos-btn-secondary flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Date Range
          </button>
          <button
            onClick={exportPDF}
            className="pos-btn-primary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Templates Section */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Printable Report Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={handlePrintSales}
          className="pos-card p-4 flex items-center gap-4 hover:border-primary/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Sales Report</h3>
            <p className="text-xs text-muted-foreground">Full sales history & totals</p>
          </div>
        </button>

        <button
          onClick={handlePrintInventory}
          className="pos-card p-4 flex items-center gap-4 hover:border-success/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Inventory Report</h3>
            <p className="text-xs text-muted-foreground">Stock levels & valuation</p>
          </div>
        </button>

        <button
          onClick={handlePrintEmployee}
          className="pos-card p-4 flex items-center gap-4 hover:border-warning/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Employee Report</h3>
            <p className="text-xs text-muted-foreground">Staff performance</p>
          </div>
        </button>

        <button
          onClick={handlePrintProduct}
          className="pos-card p-4 flex items-center gap-4 hover:border-accent/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Product Report</h3>
            <p className="text-xs text-muted-foreground">Top selling items</p>
          </div>
        </button>

        <button
          onClick={handlePrintDaily}
          className="pos-card p-4 flex items-center gap-4 hover:border-primary/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Daily Summary</h3>
            <p className="text-xs text-muted-foreground">Today's Z-Report</p>
          </div>
        </button>
      </div>

      <div id="reports-content" className="bg-background">

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="pos-stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-foreground">Rs. {totalSales.toLocaleString()}</p>
          </div>
          <div className="pos-stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">Gross Profit</p>
            </div>
            <p className="text-2xl font-bold text-success">Rs. {totalProfit.toLocaleString()}</p>
          </div>
          <div className="pos-stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Package className="w-5 h-5 text-accent-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{sales.length}</p>
          </div>
          <div className="pos-stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <p className="text-sm text-muted-foreground">Avg. Sale</p>
            </div>
            <p className="text-2xl font-bold text-foreground">Rs. {avgSale.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Monthly Sales */}
          <div className="pos-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Monthly Sales & Profit</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                    formatter={(value: number) => [`Rs. ${value.toLocaleString()}`]}
                  />
                  <Bar dataKey="sales" fill="hsl(207, 100%, 65%)" radius={[4, 4, 0, 0]} name="Sales" />
                  <Bar dataKey="profit" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="pos-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Sales by Category</h3>
            <div className="h-72 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cashier Performance */}
        <div className="pos-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Cashier Performance</h3>
          <div className="overflow-x-auto">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Cashier</th>
                  <th>Total Sales</th>
                  <th>Amount</th>
                  <th>Avg. per Sale</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {cashierPerformance.map((cashier, index) => (
                  <tr key={index}>
                    <td className="font-medium text-foreground">{cashier.name}</td>
                    <td className="text-muted-foreground">{cashier.sales} sales</td>
                    <td className="font-semibold text-foreground">Rs. {cashier.amount.toLocaleString()}</td>
                    <td className="text-muted-foreground">
                      Rs. {Math.floor(cashier.amount / cashier.sales).toLocaleString()}
                    </td>
                    <td>
                      <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, (cashier.sales / 50) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Reports;
