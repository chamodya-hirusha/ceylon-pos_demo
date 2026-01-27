import React, { useMemo } from 'react';
import { generateDemoSales, products, cashiers } from '@/data/demoData';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const sales = useMemo(() => generateDemoSales(), []);
  const { t, i18n } = useTranslation();

  // Calculate stats
  const todaySales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sales.filter((s) => s.timestamp >= today);
  }, [sales]);

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const yesterdayTotal = 125000; // Demo comparison
  const changePercent = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Chart data
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      name: day,
      sales: Math.floor(Math.random() * 80000) + 40000,
      profit: Math.floor(Math.random() * 15000) + 8000,
    }));
  }, []);

  const topProducts = useMemo(() => {
    return products.slice(0, 5).map((p) => {
      const name = i18n.language.startsWith('si') && p.nameSinhala ? p.nameSinhala : p.name;
      return {
        name: name.length > 20 ? name.slice(0, 20) + '...' : name,
        sales: Math.floor(Math.random() * 50) + 10,
      };
    });
  }, [i18n.language]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 mt-2 lg:mt-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('dashboard')}</h1>
        <p className="text-sm lg:text-base text-muted-foreground">{t('welcome_back')} {t('dashboard_subtext')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Today's Sales */}
        <div className="pos-stat-card p-4 lg:p-6 translate-y-0 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
            </div>
            <div className={`flex items-center gap-1 text-[10px] lg:text-sm font-bold ${changePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
              {changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(changePercent).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-lg lg:text-2xl font-black text-foreground mt-4 truncate">Rs. {todayTotal.toLocaleString()}</p>
          <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('today_sales')}</p>
        </div>

        {/* Orders */}
        <div className="pos-stat-card p-4 lg:p-6 translate-y-0 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-success" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-success/50" />
          </div>
          <p className="text-lg lg:text-2xl font-black text-foreground mt-4">{todaySales.length}</p>
          <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('today_orders')}</p>
        </div>

        {/* Products */}
        <div className="pos-stat-card p-4 lg:p-6 translate-y-0 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-accent flex items-center justify-center">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-accent-foreground" />
            </div>
            <Package className="w-5 h-5 text-accent-foreground/30" />
          </div>
          <p className="text-lg lg:text-2xl font-black text-foreground mt-4">{products.length}</p>
          <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('total_products')}</p>
        </div>

        {/* Active Cashiers */}
        <div className="pos-stat-card p-4 lg:p-6 translate-y-0 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-warning" />
            </div>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          <p className="text-lg lg:text-2xl font-black text-foreground mt-4">{cashiers.filter((c) => c.active).length}</p>
          <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('active_cashiers')}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Weekly Sales Chart */}
        <div className="lg:col-span-2 pos-card p-6">
          <h3 className="font-semibold text-foreground mb-4">{t('weekly_sales_overview')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(207, 100%, 65%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(207, 100%, 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                  formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(207, 100%, 65%)"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="pos-card p-6">
          <h3 className="font-semibold text-foreground mb-4">{t('top_products')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar dataKey="sales" fill="hsl(207, 100%, 65%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="pos-card p-6 border-warning/30 bg-warning/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('low_stock_alert')}</h3>
              <p className="text-sm text-muted-foreground">{t('need_restocking', { count: lowStockProducts.length })}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {i18n.language.startsWith('si') && product.nameSinhala ? product.nameSinhala : product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <span className="pos-badge-warning whitespace-nowrap">{product.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales */}
      <div className="pos-card mt-6 overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="font-semibold text-foreground">{t('recent_sales')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="pos-table">
            <thead>
              <tr>
                <th>{t('invoice')}</th>
                <th>{t('cashier')}</th>
                <th>{t('items')}</th>
                <th>{t('action')}</th>
                <th>{t('total')}</th>
                <th>{t('settings')}</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id}>
                  <td className="font-medium text-foreground">{sale.id}</td>
                  <td className="text-muted-foreground">{sale.cashierName}</td>
                  <td className="text-muted-foreground">{sale.items.length} items</td>
                  <td>
                    <span className={`pos-badge ${sale.paymentMethod === 'cash' ? 'pos-badge-success' :
                      sale.paymentMethod === 'card' ? 'pos-badge-primary' : 'pos-badge-warning'
                      }`}>
                      {sale.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="font-semibold text-foreground">Rs. {sale.total.toLocaleString()}</td>
                  <td className="text-muted-foreground text-sm">
                    {sale.timestamp.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
