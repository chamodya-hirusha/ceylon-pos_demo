import React from 'react';
import { Product } from '@/data/demoData';
import { Package, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  isFocused?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isFocused }) => {
  const { i18n } = useTranslation();
  const isLowStock = product.stock <= product.minStock;
  const isOutOfStock = product.stock === 0;

  const displayName = i18n.language.startsWith('si') && product.nameSinhala
    ? product.nameSinhala
    : product.name;

  return (
    <button
      onClick={() => !isOutOfStock && onClick(product)}
      disabled={isOutOfStock}
      className={`pos-card-hover p-4 text-left flex flex-col h-full border-2 transition-all ${isFocused ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-transparent'
        } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Icon / Image placeholder */}
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
        <Package className="w-6 h-6 text-primary" />
      </div>

      {/* Product info */}
      <div className="flex-1">
        <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-1">
          {displayName}
        </h4>
        <p className="text-xs text-muted-foreground">{product.sku}</p>
      </div>

      {/* Price and stock */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-lg">
            Rs. {product.price.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">/{product.unit}</span>
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1 mt-2">
          {isOutOfStock ? (
            <span className="pos-badge-danger">Out of Stock</span>
          ) : isLowStock ? (
            <span className="pos-badge-warning flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Low: {product.stock}
            </span>
          ) : (
            <span className="pos-badge-success">In Stock: {product.stock}</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
