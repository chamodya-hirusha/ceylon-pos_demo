
import { Sale, Product, Cashier } from '@/data/demoData';

const reportTemplateStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  
  body {
    font-family: 'Inter', sans-serif;
    color: #1a1a1a;
    line-height: 1.5;
    margin: 0;
    padding: 20px;
    background: white;
  }
  
  .report-header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 20px;
  }
  
  .shop-name {
    font-size: 24px;
    font-weight: 800;
    margin: 0;
    color: #000;
    text-transform: uppercase;
  }
  
  .report-title {
    font-size: 18px;
    font-weight: 600;
    margin: 5px 0;
    color: #4b5563;
  }
  
  .report-meta {
    font-size: 12px;
    color: #6b7280;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    padding: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }
  
  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    color: #6b7280;
    font-weight: 600;
  }
  
  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
  }
  
  th {
    text-align: left;
    background: #f3f4f6;
    padding: 10px;
    font-size: 12px;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
  }
  
  td {
    padding: 10px;
    font-size: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  tr:nth-child(even) {
    background: #fafafa;
  }
  
  .text-right { text-align: right; }
  .font-bold { font-weight: 700; }
  
  .footer {
    margin-top: 50px;
    text-align: center;
    font-size: 10px;
    color: #9ca3af;
    border-top: 1px solid #f0f0f0;
    padding-top: 20px;
  }
  
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
`;

export const generateSalesReportHTML = (sales: Sale[], shopName: string, dateRange: string) => {
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalTax = sales.reduce((sum, s) => sum + s.tax, 0);
    const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);

    const rows = sales.map(sale => `
    <tr>
      <td>${sale.id}</td>
      <td>${new Date(sale.timestamp).toLocaleString()}</td>
      <td>${sale.cashierName}</td>
      <td>${sale.paymentMethod.toUpperCase()}</td>
      <td class="text-right">Rs. ${sale.total.toLocaleString()}</td>
    </tr>
  `).join('');

    return `
    <html>
      <head>
        <style>${reportTemplateStyles}</style>
      </head>
      <body>
        <div class="report-header">
          <h1 class="shop-name">${shopName}</h1>
          <h2 class="report-title">Sales Summary Report</h2>
          <p class="report-meta">Period: ${dateRange} | Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Sales</div>
            <div class="stat-value">${sales.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value">Rs. ${totalRevenue.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Tax</div>
            <div class="stat-value">Rs. ${totalTax.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Avg. Order Value</div>
            <div class="stat-value">Rs. ${(totalRevenue / sales.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date & Time</th>
              <th>Cashier</th>
              <th>Method</th>
              <th class="text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr class="font-bold">
              <td colspan="4" class="text-right">GRAND TOTAL</td>
              <td class="text-right">Rs. ${totalRevenue.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>This is a computer-generated report. End of Sales Report.</p>
        </div>
      </body>
    </html>
  `;
};

export const generateInventoryReportHTML = (products: Product[], shopName: string) => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStockItems = products.filter(p => p.stock <= p.minStock).length;

    const rows = products.map(p => `
    <tr>
      <td>${p.sku}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td class="text-right">${p.stock} ${p.unit}</td>
      <td class="text-right">Rs. ${p.price.toLocaleString()}</td>
      <td class="text-right">Rs. ${(p.price * p.stock).toLocaleString()}</td>
      <td>${p.stock <= p.minStock ? '<span style="color: #ef4444; font-weight: bold;">Low Stock</span>' : 'In Stock'}</td>
    </tr>
  `).join('');

    return `
    <html>
      <head>
        <style>${reportTemplateStyles}</style>
      </head>
      <body>
        <div class="report-header">
          <h1 class="shop-name">${shopName}</h1>
          <h2 class="report-title">Inventory & Stock Report</h2>
          <p class="report-meta">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Products</div>
            <div class="stat-value">${products.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Stock Value</div>
            <div class="stat-value">Rs. ${totalValue.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Low Stock Alerts</div>
            <div class="stat-value" style="color: #ef4444">${lowStockItems} Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Categories</div>
            <div class="stat-value">${new Set(products.map(p => p.category)).size}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th class="text-right">Stock</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Report generated by Ceylon POS. End of Inventory Report.</p>
        </div>
      </body>
    </html>
  `;
};

export const generateEmployeePerformanceHTML = (sales: Sale[], cashiers: Cashier[], shopName: string, dateRange: string) => {
    const performanceData = cashiers.map(cashier => {
        const cashierSales = sales.filter(s => s.cashierId === cashier.id);
        const totalAmount = cashierSales.reduce((sum, s) => sum + s.total, 0);
        return {
            name: cashier.name,
            role: cashier.role,
            count: cashierSales.length,
            amount: totalAmount,
            avg: cashierSales.length > 0 ? totalAmount / cashierSales.length : 0
        };
    }).sort((a, b) => b.amount - a.amount);

    const rows = performanceData.map(data => `
    <tr>
      <td>${data.name}</td>
      <td>${data.role.toUpperCase()}</td>
      <td class="text-right">${data.count}</td>
      <td class="text-right">Rs. ${data.amount.toLocaleString()}</td>
      <td class="text-right">Rs. ${data.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
    </tr>
  `).join('');

    return `
    <html>
      <head>
        <style>${reportTemplateStyles}</style>
      </head>
      <body>
        <div class="report-header">
          <h1 class="shop-name">${shopName}</h1>
          <h2 class="report-title">Employee Performance Report</h2>
          <p class="report-meta">Period: ${dateRange} | Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role</th>
              <th class="text-right">Sales Count</th>
              <th class="text-right">Total Revenue</th>
              <th class="text-right">Avg. Order Value</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Confidential Employee Data. End of Performance Report.</p>
        </div>
      </body>
    </html>
  `;
};


export const generateProductPerformanceHTML = (sales: Sale[], products: Product[], shopName: string, dateRange: string) => {
    const productStats = products.map(product => {
        let soldQty = 0;
        let revenue = 0;
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (item.product.id === product.id) {
                    soldQty += item.quantity;
                    revenue += item.product.price * item.quantity * (1 - item.discount / 100);
                }
            });
        });
        return { ...product, soldQty, revenue };
    }).filter(p => p.soldQty > 0).sort((a, b) => b.revenue - a.revenue);

    const rows = productStats.map(p => `
    <tr>
      <td>${p.sku}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td class="text-right">${p.soldQty} ${p.unit}</td>
      <td class="text-right">Rs. ${p.revenue.toLocaleString()}</td>
    </tr>
  `).join('');

    return `
    <html>
      <head>
        <style>${reportTemplateStyles}</style>
      </head>
      <body>
        <div class="report-header">
          <h1 class="shop-name">${shopName}</h1>
          <h2 class="report-title">Product Performance Report</h2>
          <p class="report-meta">Period: ${dateRange} | Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th class="text-right">Qty Sold</th>
              <th class="text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Product analytics report. End of Report.</p>
        </div>
      </body>
    </html>
  `;
};

export const generateDailySummaryHTML = (sales: Sale[], shopName: string) => {
    const today = new Date().toLocaleDateString();
    const todaySales = sales.filter(s => new Date(s.timestamp).toLocaleDateString() === today);

    const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
    const cashSales = todaySales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
    const cardSales = todaySales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);
    const creditSales = todaySales.filter(s => s.paymentMethod === 'credit').reduce((sum, s) => sum + s.total, 0);

    return `
    <html>
      <head>
        <style>${reportTemplateStyles}</style>
      </head>
      <body>
        <div class="report-header">
          <h1 class="shop-name">${shopName}</h1>
          <h2 class="report-title">Daily Summary (Z-Report)</h2>
          <p class="report-meta">Date: ${today} | Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Transactions</div>
            <div class="stat-value">${todaySales.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value">Rs. ${totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <h3 style="margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Method Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cash</td>
              <td class="text-right">Rs. ${cashSales.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Card</td>
              <td class="text-right">Rs. ${cardSales.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Store Credit</td>
              <td class="text-right">Rs. ${creditSales.toLocaleString()}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-bold">
              <td>TOTAL</td>
              <td class="text-right">Rs. ${totalRevenue.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer" style="margin-top: 100px;">
          <div style="display: flex; justify-content: space-between; padding: 0 50px;">
            <div style="border-top: 1px solid #ccc; width: 150px; padding-top: 5px;">Manager Signature</div>
            <div style="border-top: 1px solid #ccc; width: 150px; padding-top: 5px;">Cashier Signature</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const printHTML = (html: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
};
