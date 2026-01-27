import React, { useState, useMemo, useEffect } from 'react';
import { products, categories, Product } from '@/data/demoData';
import ProductCard from './ProductCard';
import { Search, Barcode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';

interface ProductGridProps {
  onProductSelect: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onProductSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { t, i18n } = useTranslation();
  const { isReturnMode, originalItems } = useCart();
  const [inventoryOverrides, setInventoryOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem('simulated_inventory');
    if (stored) {
      setInventoryOverrides(JSON.parse(stored));
    }
  }, []);

  const filteredProducts = useMemo(() => {
    // Apply inventory overrides
    const productsWithStock = products.map(p => ({
      ...p,
      stock: inventoryOverrides[p.id] !== undefined ? inventoryOverrides[p.id] : p.stock
    }));

    let filtered = productsWithStock;

    // In return mode, only allow original items
    if (isReturnMode) {
      const originalIds = originalItems.map(i => i.product.id);
      filtered = products.filter(p => originalIds.includes(p.id));
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search term
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
  }, [selectedCategory, searchTerm, isReturnMode, originalItems]);

  // Reset focus when filters change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [selectedCategory, searchTerm]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredProducts.length === 0) return;

      const itemsPerRow = 3; // Standard grid layout

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % filteredProducts.length);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex === -1) {
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) => Math.min(prev + itemsPerRow, filteredProducts.length - 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex !== -1) {
            setFocusedIndex((prev) => Math.max(prev - itemsPerRow, -1));
          }
          break;
        case 'Enter':
          if (focusedIndex !== -1) {
            e.preventDefault();
            onProductSelect(filteredProducts[focusedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, filteredProducts, onProductSelect]);

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`${t('search_products')} (F1)`}
            className="pos-input pl-12 pr-12"
            autoFocus
          />
          <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4 overflow-x-auto scrollbar-thin pb-2">
        <div className="flex gap-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? 'pos-category-btn-active' : 'pos-category-btn'}
            >
              <span className="mr-1.5">{category.icon}</span>
              {i18n.language.startsWith('si') ? category.nameSinhala : category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin pr-1">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Search className="w-16 h-16 mb-4 opacity-30" />
            <p>{t('no_products_found')}</p>
          </div>
        ) : (
          <div className="pos-product-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={onProductSelect}
                isFocused={index === focusedIndex}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
