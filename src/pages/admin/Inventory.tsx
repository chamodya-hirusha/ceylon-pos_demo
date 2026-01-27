import React, { useState, useMemo, useEffect } from 'react';
import { products, categories } from '@/data/demoData';
import { Search, ArrowUp, ArrowDown, AlertTriangle, Package, Filter, TrendingDown } from 'lucide-react';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (stockFilter === 'low') {
      filtered = filtered.filter((p) => p.stock <= p.minStock && p.stock > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter((p) => p.stock === 0);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [stockFilter, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter]);

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels and manage inventory</p>
        </div>
        <div className="flex gap-2">
          <button className="pos-btn-secondary flex items-center gap-2">
            <ArrowDown className="w-5 h-5" />
            Stock In
          </button>
          <button className="pos-btn-secondary flex items-center gap-2">
            <ArrowUp className="w-5 h-5" />
            Stock Out
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="pos-stat-card">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
        </div>
        <div className="pos-stat-card">
          <p className="text-sm text-muted-foreground">Inventory Value</p>
          <p className="text-2xl font-bold text-primary">Rs. {totalValue.toLocaleString()}</p>
        </div>
        <div className="pos-stat-card border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </div>
          <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
        </div>
        <div className="pos-stat-card border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{outOfStockCount}</p>
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
              placeholder="Search products..."
              className="pos-input pl-12"
            />
          </div>

          {/* Stock Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStockFilter('all')}
              className={stockFilter === 'all' ? 'pos-category-btn-active' : 'pos-category-btn'}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={stockFilter === 'low' ? 'pos-category-btn-active' : 'pos-category-btn'}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={stockFilter === 'out' ? 'pos-category-btn-active' : 'pos-category-btn'}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="pos-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Unit</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => {
                const category = categories.find((c) => c.id === product.category);
                const isLowStock = product.stock <= product.minStock && product.stock > 0;
                const isOutOfStock = product.stock === 0;
                const stockValue = product.price * product.stock;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.supplier || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm text-muted-foreground">{product.sku}</td>
                    <td>
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>{category?.icon}</span>
                        <span className="text-muted-foreground">{category?.name}</span>
                      </span>
                    </td>
                    <td className="font-bold text-foreground">{product.stock}</td>
                    <td className="text-muted-foreground">{product.minStock}</td>
                    <td className="text-muted-foreground uppercase text-sm">{product.unit}</td>
                    <td className="font-medium text-foreground">Rs. {stockValue.toLocaleString()}</td>
                    <td>
                      {isOutOfStock ? (
                        <span className="pos-badge-danger">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="pos-badge-warning">Low Stock</span>
                      ) : (
                        <span className="pos-badge-success">In Stock</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No products found</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {currentProducts.length} of {filteredProducts.length} products
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
  );
};

export default Inventory;
