import React, { useState, useEffect } from 'react';
import type { Product } from '../types';

interface ProductListProps {
  productos: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreProducts: () => void;
}

interface Toast {
  id: string;
  message: string;
  productName: string;
  type: 'success' | 'error';
}

const Icons = {
  Package: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  ShoppingCart: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16h12M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"
      />
    </svg>
  ),
  Plus: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  X: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
};

const LoadingSpinner = () => (
  <div className="inline-flex items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
  </div>
);

// Toast Component
const Toast: React.FC<{ 
  toast: Toast; 
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-green-500 backdrop-blur-xl rounded-xl p-4 border border-emerald-400/50 shadow-2xl shadow-emerald-500/20 max-w-sm animate-bounce-in">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
          <Icons.Check />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">✨ Added to Cart!</p>
          <p className="text-emerald-100 text-xs mt-1 truncate">
            {toast.productName}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-emerald-200 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <Icons.X />
        </button>
      </div>
    </div>
  );
};

const ProductList: React.FC<ProductListProps> = ({
  productos,
  addToCart,
  hasMore,
  loadingMore,
  loadMoreProducts,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.codigo);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      addToCart(product);
      
      // Add toast notification
      const newToast: Toast = {
        id: Date.now().toString(),
        message: 'Added to cart!',
        productName: product.nombre,
        type: 'success'
      };
      
      setToasts(prev => [...prev, newToast]);
      setAddingToCart(null);
    }, 300);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Icons.Package />
          All Products
        </h3>
        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
          {productos.length} loaded
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {productos.map((product: Product) => (
          <div
            key={product.codigo}
            className={`bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group ${
              addingToCart === product.codigo ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : ''
            }`}
          >
            <h5 className="text-white font-medium mb-2 group-hover:text-blue-400 transition-colors">
              {product.nombre}
            </h5>
            <div className="space-y-1 text-sm mb-4">
              <p className="text-slate-400">
                Code:{" "}
                <span className="text-slate-300">
                  {product.codigo}
                </span>
              </p>
              <p className="text-emerald-400 font-semibold">
                ${product.precio}
              </p>
              <p className="text-slate-400">
                Stock:{" "}
                <span
                  className={
                    product.cantidad > 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {product.cantidad}
                </span>
              </p>
              <p className="text-blue-400">{product.categoria}</p>
            </div>
            <button
              onClick={() => handleAddToCart(product)}
              disabled={product.cantidad <= 0 || addingToCart === product.codigo}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed btn-cart ${
                addingToCart === product.codigo
                  ? 'bg-emerald-500/40 text-emerald-300 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95'
              }`}
            >
              {addingToCart === product.codigo ? (
                <>
                  <LoadingSpinner />
                  Adding...
                </>
              ) : (
                <>
                  <Icons.ShoppingCart />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMoreProducts}
            disabled={loadingMore}
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            {loadingMore ? (
              <>
                <LoadingSpinner />
                Loading More...
              </>
            ) : (
              <>
                <Icons.Plus />
                Load More Products
              </>
            )}
          </button>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="animate-slide-in"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <Toast
              toast={toast}
              onRemove={removeToast}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
