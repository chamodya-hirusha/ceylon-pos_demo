import React, { useState, useMemo, useEffect } from 'react';
import { products, categories } from '@/data/demoData';
import { Search, Plus, Edit2, Trash2, Download, Package, Barcode, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t, i18n } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.nameSinhala && p.nameSinhala.toLowerCase().includes(term)) ||
          p.sku.toLowerCase().includes(term) ||
          p.barcode.includes(term)
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'building',
    price: '',
    stock: '',
    unit: 'pcs'
  });

  const generateBarcode = () => {
    // Generate a random 12-digit numeric string
    const randomDigits = Math.floor(Math.random() * 900000000000) + 100000000000;
    setNewProduct(prev => ({ ...prev, barcode: randomDigits.toString() }));
  };

  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      console.log('Updating product:', newProduct);
    } else {
      console.log('Adding product:', newProduct);
    }
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setNewProduct({ name: '', sku: '', barcode: '', category: 'building', price: '', stock: '', unit: 'pcs' });
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      unit: product.unit
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2 lg:mt-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('products')}</h1>
          <p className="text-sm lg:text-base text-muted-foreground">{t('manage_catalog')}</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="pos-btn-primary flex items-center justify-center gap-2 py-3 sm:py-2.5 px-6"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">{t('add_product')}</span>
        </button>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                {editingProduct ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                {editingProduct ? 'Edit Product' : t('add_product')}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                  setNewProduct({ name: '', sku: '', barcode: '', category: 'building', price: '', stock: '', unit: 'pcs' });
                }}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                title="ESC"
              >
                <Trash2 className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Product Name</label>
                  <input
                    required
                    type="text"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="pos-input"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">SKU / Code</label>
                  <input
                    required
                    type="text"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="pos-input"
                    placeholder="BLD-001"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Barcode</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={newProduct.barcode}
                      onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })}
                      className="pos-input pr-12"
                      placeholder="123456789012"
                    />
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      title="Auto-generate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="pos-input"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Price (LKR)</label>
                  <input
                    required
                    type="number"
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="pos-input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Initial Stock</label>
                  <input
                    required
                    type="number"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="pos-input"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Unit of Measure</label>
                  <div className="flex gap-2">
                    {['pcs', 'kg', 'ft', 'ltr', 'meter'].map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, unit: u as any })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${newProduct.unit === u
                          ? 'bg-primary text-primary-foreground shadow-pos-primary'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                    setNewProduct({ name: '', sku: '', barcode: '', category: 'building', price: '', stock: '', unit: 'pcs' });
                  }}
                  className="flex-1 pos-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 pos-btn-primary"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              placeholder={t('search_products')}
              className="pos-input pl-12 h-12 lg:h-11"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pos-input h-12 lg:h-11 sm:w-48 bg-muted/50"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {i18n.language.startsWith('si') ? cat.nameSinhala : cat.name}
                </option>
              ))}
            </select>

            <button className="pos-btn-secondary h-12 lg:h-11 flex items-center justify-center gap-2 px-6">
              <Download className="w-5 h-5" />
              <span className="font-bold">{t('export')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="pos-table">
            <thead>
              <tr>
                <th>{t('products')}</th>
                <th>{t('sku')}</th>
                <th>{t('dashboard')}</th>
                <th>{t('price')}</th>
                <th>{t('inventory')}</th>
                <th>{t('unit')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => {
                const category = categories.find((c) => c.id === product.category);
                const isLowStock = product.stock <= product.minStock;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {i18n.language.startsWith('si') && product.nameSinhala ? product.nameSinhala : product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{product.barcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground font-mono text-sm">{product.sku}</td>
                    <td>
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>{category?.icon}</span>
                        <span className="text-muted-foreground">
                          {i18n.language.startsWith('si') && category?.nameSinhala ? category.nameSinhala : category?.name}
                        </span>
                      </span>
                    </td>
                    <td className="font-semibold text-foreground">Rs. {product.price.toLocaleString()}</td>
                    <td>
                      <span className={isLowStock ? 'pos-badge-warning' : 'pos-badge-success'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="text-muted-foreground uppercase text-sm">{product.unit}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
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
            <p>{t('no_products_found')}</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              {t('showing_products', {
                count: currentProducts.length,
                total: filteredProducts.length
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
  );
};

export default Products;
