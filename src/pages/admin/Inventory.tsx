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
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2 lg:mt-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Inventory Management</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Track stock levels and manage inventory</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button className="pos-btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4">
            <ArrowDown className="w-5 h-5" />
            <span className="font-bold">Stock In</span>
          </button>
          <button className="pos-btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4">
            <ArrowUp className="w-5 h-5" />
            <span className="font-bold">Stock Out</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        <div className="pos-stat-card p-4">
          <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Total Products</p>
          <p className="text-xl lg:text-2xl font-black text-foreground mt-2">{products.length}</p>
        </div>
        <div className="pos-stat-card p-4">
          <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Inventory Value</p>
          <p className="text-xl lg:text-2xl font-black text-primary mt-2">Rs. {totalValue.toLocaleString()}</p>
        </div>
        <div className="pos-stat-card p-4 border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Low Stock</p>
          </div>
          <p className="text-xl lg:text-2xl font-black text-warning mt-2">{lowStockCount}</p>
        </div>
        <div className="pos-stat-card p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Out of Stock</p>
          </div>
          <p className="text-xl lg:text-2xl font-black text-destructive mt-2">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="pos-card p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inventory..."
              className="pos-input pl-12 h-12 lg:h-11"
            />
          </div>

          {/* Stock Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${stockFilter === 'all' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap flex items-center gap-2 ${stockFilter === 'low' ? 'bg-warning text-warning-foreground shadow-lg shadow-warning/25' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              <AlertTriangle className="w-4 h-4" />
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${stockFilter === 'out' ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
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
          <div className="p-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
              Showing {currentProducts.length} of {filteredProducts.length} items
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pos-btn-secondary py-2 px-3 sm:px-4 disabled:opacity-50 text-xs sm:text-sm h-10"
              >
                Prev
              </button>
              <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] sm:max-w-none scrollbar-none">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${currentPage === page
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-muted text-muted-foreground'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pos-btn-secondary py-2 px-3 sm:px-4 disabled:opacity-50 text-xs sm:text-sm h-10"
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
