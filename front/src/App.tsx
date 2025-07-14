import { useState, useEffect, useCallback } from "react";
import LandingPage from "./LandingPage";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import ProductList from "./components/ProductList";
import Notification from "./components/Notification";
import type {
  Product,
  CartItem,
  Compra,
  ProductForm,
  UserInfo,
  NotificationData,
} from "./types";

// API URLs
const API_URLS = {
  MS1: "https://dchblr3rv8.execute-api.us-east-1.amazonaws.com/dev",
  MS2: "https://d3fhew8l8b.execute-api.us-east-1.amazonaws.com/dev",
  MS3: "https://bi3zdo4r1c.execute-api.us-east-1.amazonaws.com/dev",
};

// Modern Icons for 2025
const Icons = {
  Shield: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  Lightning: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  User: () => (
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Lock: () => (
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
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
  Building: () => (
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
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
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
  Search: () => (
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
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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
  Minus: () => (
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
        d="M20 12H4"
      />
    </svg>
  ),
  Trash: () => (
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Eye: () => (
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  X: () => (
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  LogOut: () => (
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
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  Receipt: () => (
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
        d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
      />
    </svg>
  ),
  Edit: () => (
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
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  Save: () => (
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
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  ),
};

// Modern Loading Component
const LoadingSpinner = () => (
  <div className="inline-flex items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
  </div>
);

// Modern Dashboard Header
const DashboardHeader: React.FC<{
  userInfo: UserInfo;
  handleLogout: () => void;
}> = ({ userInfo, handleLogout }) => (
  <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Icons.Lightning />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TechStore</h1>
            <p className="text-sm text-slate-400">Sistema Multi-Tenant</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{userInfo.user_id}</p>
            <p className="text-xs text-slate-400">{userInfo.tenant_id}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <Icons.LogOut />
          </button>
        </div>
      </div>
    </div>
  </header>
);

// Modern Navigation Tabs
const NavigationTabs: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => (
  <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-8">
        <button
          className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
            activeTab === "productos"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white hover:border-slate-300"
          }`}
          onClick={() => setActiveTab("productos")}
        >
          <Icons.Package />
          Products
        </button>
        <button
          className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
            activeTab === "compras"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white hover:border-slate-300"
          }`}
          onClick={() => setActiveTab("compras")}
        >
          <Icons.ShoppingCart />
          Shopping
        </button>
      </div>
    </div>
  </nav>
);

// Modern Search Section
const SearchSection: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: Product[];
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}> = ({
  searchTerm,
  setSearchTerm,
  filteredProducts,
  setSelectedProduct,
  addToCart,
  onEditProduct,
  onDeleteProduct,
}) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Icons.Search />
        Smart Product Search
      </h3>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icons.Search />
        </div>
        <input
          type="text"
          placeholder="Search products with fuzzy matching..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
        />
      </div>
    </div>

    {searchTerm && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium">Search Results</h4>
          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
            {filteredProducts.length} found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product: Product) => (
            <div
              key={product.codigo}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm group"
            >
              <h5 className="text-white font-medium mb-2 group-hover:text-blue-400 transition-colors">
                {product.nombre}
              </h5>
              <div className="space-y-1 text-sm mb-4">
                <p className="text-slate-400">
                  Code: <span className="text-slate-300">{product.codigo}</span>
                </p>
                <p className="text-emerald-400 font-semibold">
                  ${product.precio}
                </p>
                <p className="text-slate-400">
                  Stock:{" "}
                  <span
                    className={
                      product.cantidad > 0 ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {product.cantidad}
                  </span>
                </p>
                <p className="text-blue-400">{product.categoria}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 bg-blue-500/20 text-blue-400 py-2 px-3 rounded-lg text-sm hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center gap-1 font-medium"
                >
                  <Icons.Eye />
                  View
                </button>
                <button
                  onClick={() => onEditProduct(product)}
                  className="flex-1 bg-yellow-500/20 text-yellow-400 py-2 px-3 rounded-lg text-sm hover:bg-yellow-500/30 transition-all duration-200 flex items-center justify-center gap-1 font-medium"
                >
                  <Icons.Edit />
                  Edit
                </button>
                <button
                  onClick={() => onDeleteProduct(product)}
                  className="flex-1 bg-red-500/20 text-red-400 py-2 px-3 rounded-lg text-sm hover:bg-red-500/30 transition-all duration-200 flex items-center justify-center gap-1 font-medium"
                >
                  <Icons.Trash />
                  Delete
                </button>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.cantidad <= 0}
                  className="flex-1 bg-emerald-500/20 text-emerald-400 py-2 px-3 rounded-lg text-sm hover:bg-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Icons.ShoppingCart />
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Modern Product Form
const ProductForm: React.FC<{
  productForm: ProductForm;
  setProductForm: (form: ProductForm) => void;
  createProduct: () => void;
  loading: boolean;
}> = ({ productForm, setProductForm, createProduct, loading }) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
      <Icons.Package />
      Create New Product
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <input
        placeholder="Product Code"
        value={productForm.codigo}
        onChange={(e) =>
          setProductForm({ ...productForm, codigo: e.target.value })
        }
        className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
      />
      <input
        placeholder="Product Name"
        value={productForm.nombre}
        onChange={(e) =>
          setProductForm({ ...productForm, nombre: e.target.value })
        }
        className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
      />
      <input
        placeholder="Description"
        value={productForm.descripcion}
        onChange={(e) =>
          setProductForm({ ...productForm, descripcion: e.target.value })
        }
        className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
      />
      <input
        type="number"
        placeholder="Price"
        value={productForm.precio}
        onChange={(e) =>
          setProductForm({ ...productForm, precio: e.target.value })
        }
        className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
      />
      <input
        type="number"
        placeholder="Quantity"
        value={productForm.cantidad}
        onChange={(e) =>
          setProductForm({ ...productForm, cantidad: e.target.value })
        }
        className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
      />
      <input
        placeholder="Category"
        value={productForm.categoria}
        onChange={(e) =>
          setProductForm({ ...productForm, categoria: e.target.value })
        }
        className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
      />
    </div>

    <button
      onClick={createProduct}
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
    >
      {loading ? <LoadingSpinner /> : <Icons.Plus />}
      {loading ? "Creating Product..." : "Create Product"}
    </button>
  </div>
);

// Modern Cart Section
const CartSection: React.FC<{
  cart: CartItem[];
  updateCartQuantity: (codigo: string, newQuantity: number) => void;
  removeFromCart: (codigo: string) => void;
  realizarCompra: () => void;
  loading: boolean;
}> = ({
  cart,
  updateCartQuantity,
  removeFromCart,
  realizarCompra,
  loading,
}) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
        <Icons.ShoppingCart />
        Shopping Cart
      </h3>
      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
        {cart.length} items
      </span>
    </div>

    {cart.length === 0 ? (
      <div className="text-center py-12">
        <Icons.ShoppingCart />
        <p className="text-slate-400 mt-4">Your cart is empty</p>
        <p className="text-sm text-slate-500 mt-2">
          Add some products to get started
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="space-y-3">
          {cart.map((item: CartItem) => (
            <div
              key={item.codigo}
              className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-medium">{item.nombre}</h4>
                  <p className="text-slate-400 text-sm">{item.codigo}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.codigo, item.cantidad - 1)
                      }
                      className="p-1 text-slate-400 hover:text-white transition-colors rounded"
                    >
                      <Icons.Minus />
                    </button>
                    <span className="text-white w-8 text-center font-medium">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.codigo, item.cantidad + 1)
                      }
                      className="p-1 text-slate-400 hover:text-white transition-colors rounded"
                    >
                      <Icons.Plus />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </p>
                    <p className="text-slate-400 text-xs">
                      ${item.precio} each
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.codigo)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-white">Total</span>
            <span className="text-xl font-bold text-emerald-400">
              $
              {cart
                .reduce(
                  (sum: number, item: CartItem) =>
                    sum + item.precio * item.cantidad,
                  0
                )
                .toFixed(2)}
            </span>
          </div>
          <button
            onClick={realizarCompra}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <LoadingSpinner /> : <Icons.Receipt />}
            {loading ? "Processing..." : "Complete Purchase"}
          </button>
        </div>
      </div>
    )}
  </div>
);

// Modern Purchases Section
const ComprasSection: React.FC<{ compras: Compra[] }> = ({ compras }) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
      <Icons.Receipt />
      Purchase History
    </h3>

    {compras.length === 0 ? (
      <div className="text-center py-12">
        <Icons.Receipt />
        <p className="text-slate-400 mt-4">No purchases yet</p>
        <p className="text-sm text-slate-500 mt-2">
          Your purchase history will appear here
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {compras.map((compra: Compra, index: number) => (
          <div
            key={compra.compra_id || index}
            className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-white font-medium">
                Purchase #{compra.compra_id?.slice(-8) || index + 1}
              </h4>
              <span className="text-slate-400 text-sm">{compra.fecha}</span>
            </div>

            <div className="space-y-2">
              {compra.productos?.map((producto, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-slate-300">
                    {producto.nombre} x{producto.cantidad}
                  </span>
                  <span className="text-emerald-400 font-medium">
                    ${(producto.precio_unitario * producto.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

function App() {
  // Navigation and authentication states
  const [currentView, setCurrentView] = useState("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    user_id: "",
    tenant_id: "",
  });

  // User form states
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState("");

  // Product states
  const [productos, setProductos] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: "",
  });

  // Product editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Pagination states
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 12;

  // Shopping cart states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);

  // General states
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("productos");

  // Notification system
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (
    message: string,
    type: NotificationData["type"],
    duration = 5000
  ) => {
    const id = Date.now().toString();
    const notification: NotificationData = {
      id,
      message,
      type,
      duration,
    };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Validation functions
  const validateUserData = (userData: {
    userId: string;
    password: string;
    name?: string;
    tenantId?: string;
  }) => {
    const errors = [];

    if (!userData.userId || userData.userId.trim().length < 3) {
      errors.push("El ID de usuario debe tener al menos 3 caracteres");
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }

    if (
      userData.name !== undefined &&
      (!userData.name || userData.name.trim().length < 2)
    ) {
      errors.push("El nombre debe tener al menos 2 caracteres");
    }

    if (
      userData.tenantId !== undefined &&
      (!userData.tenantId || userData.tenantId.trim().length < 2)
    ) {
      errors.push("El ID de organización debe tener al menos 2 caracteres");
    }

    return errors;
  };

  const getErrorMessage = (
    status: number,
    data: { mensaje?: string; error?: string }
  ) => {
    switch (status) {
      case 400:
        return (
          data.mensaje || "Datos inválidos. Verifica la información enviada."
        );
      case 401:
        return "Credenciales incorrectas. Verifica tu usuario y contraseña.";
      case 403:
        return "Acceso denegado. No tienes permisos para realizar esta acción.";
      case 404:
        return "Usuario no encontrado. Verifica que el usuario esté registrado.";
      case 409:
        return "El usuario ya existe. Intenta con un ID de usuario diferente.";
      case 422:
        return "Datos incorrectos. Algunos campos no tienen el formato válido.";
      case 500:
        return "Error interno del servidor. Intenta nuevamente en unos minutos.";
      case 503:
        return "Servicio no disponible temporalmente. Intenta más tarde.";
      default:
        return (
          data.mensaje ||
          data.error ||
          "Error inesperado. Contacta al soporte técnico."
        );
    }
  };

  // Authentication functions
  const handleCreateUser = async () => {
    setLoading(true);
    setResponse(""); // Clear previous messages

    // Client-side validation
    const validationErrors = validateUserData({
      userId: userId.trim(),
      password,
      name: name.trim(),
      tenantId: tenantId.trim(),
    });

    if (validationErrors.length > 0) {
      const errorMsg = `Errores de validación: ${validationErrors.join(", ")}`;
      addNotification(errorMsg, "warning");
      setResponse(
        JSON.stringify(
          {
            mensaje: errorMsg,
          },
          null,
          2
        )
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URLS.MS1}/usuarios/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId.trim(),
          name: name.trim(),
          password: password,
          tenant_id: tenantId.trim(),
        }),
      });

      const data = await res.json();

      // Debug logging to see what the server is returning
      console.log("Registration response status:", res.status);
      console.log("Registration response data:", data);

      // Check if the registration was successful
      // If we get a 2xx status code, consider it success
      const isSuccess = res.ok; // res.ok is true for status 200-299

      if (isSuccess) {
        // Use the server message if available, otherwise use our own
        const successMessage =
          data.message ||
          data.mensaje ||
          "¡Usuario registrado exitosamente! Te redirigiremos al login.";
        addNotification(successMessage, "success", 3000);
        setResponse(JSON.stringify({ mensaje: successMessage }, null, 2));
        setTimeout(() => {
          setResponse(""); // Clear message before switching views
          setCurrentView("login");
          // Pre-fill login form with registration data
          // Keep userId and password from registration
          // Clear only name and tenantId as they're not needed for login
          setName("");
          setTenantId("");
          // Show notification about pre-filled data
          addNotification(
            "Datos listos para el login. ¡Solo haz clic en Iniciar Sesión!",
            "info",
            4000
          );
        }, 3000);
      } else {
        // Show specific error message based on status code
        console.log("Registration failed with status:", res.status);
        console.log("Server error response:", data);

        // Try to get the most appropriate error message
        let errorMsg;
        if (data.mensaje) {
          errorMsg = data.mensaje;
        } else if (data.message) {
          errorMsg = data.message;
        } else if (data.error) {
          errorMsg = data.error;
        } else {
          errorMsg = getErrorMessage(res.status, data);
        }

        addNotification(errorMsg, "error");
        setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg =
        "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.";
      addNotification(errorMsg, "error");
      setResponse(
        JSON.stringify(
          {
            mensaje: errorMsg,
          },
          null,
          2
        )
      );
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setResponse(""); // Clear previous messages

    // Client-side validation
    const validationErrors = validateUserData({
      userId: userId.trim(),
      password,
    });

    if (validationErrors.length > 0) {
      const errorMsg = `Errores de validación: ${validationErrors.join(", ")}`;
      addNotification(errorMsg, "warning");
      setResponse(
        JSON.stringify(
          {
            mensaje: errorMsg,
          },
          null,
          2
        )
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URLS.MS1}/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      // Check if login was successful
      if (res.ok && data.token) {
        addNotification(`¡Bienvenido, ${data.user_id}!`, "success", 3000);
        setToken(data.token);
        setUserInfo({ user_id: data.user_id, tenant_id: data.tenant_id });
        setIsAuthenticated(true);
        setCurrentView("dashboard");
        // Reset pagination state when logging in
        setCurrentOffset(0);
        setHasMore(true);
        loadProductos(0, false);
        // Clear form fields
        setUserId("");
        setPassword("");
        // Don't show response for successful login
      } else {
        // Show specific error message based on status code
        const errorMsg = getErrorMessage(res.status, data);
        addNotification(errorMsg, "error");
        setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.";
      addNotification(errorMsg, "error");
      setResponse(
        JSON.stringify(
          {
            mensaje: errorMsg,
          },
          null,
          2
        )
      );
    }
    setLoading(false);
  };

  const handleLogout = () => {
    addNotification("Sesión cerrada exitosamente", "info", 2000);
    setToken("");
    setUserInfo({ user_id: "", tenant_id: "" });
    setIsAuthenticated(false);
    setCurrentView("login");
    setCart([]);
    setProductos([]);
    setCompras([]);
    setResponse(""); // Clear any previous error messages
    // Clear sensitive form data
    setUserId("");
    setPassword("");
    setShowPassword(false);
    setName("");
    setTenantId("");
    // Reset pagination state
    setCurrentOffset(0);
    setHasMore(true);
    setLoadingMore(false);
  };

  // Product functions
  const loadProductos = async (offset = 0, append = false) => {
    try {
      const url = `${API_URLS.MS2}/productos/listar?limit=${PAGE_SIZE}&offset=${offset}`;

      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.productos) {
        if (append) {
          setProductos((prev) => [...prev, ...data.productos]);
        } else {
          setProductos(data.productos);
          setFilteredProducts(data.productos);
        }

        // Update pagination info
        const hasMoreProducts = data.pagination?.hasMore || false;
        const nextOffset = data.pagination?.nextOffset || offset + PAGE_SIZE;

        setHasMore(hasMoreProducts);
        setCurrentOffset(nextOffset);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    await loadProductos(currentOffset, true);
    setLoadingMore(false);
  };

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  // Advanced fuzzy search
  const fuzzyMatch = useCallback(
    (
      searchTerm: string,
      targetText: string,
      threshold: number = 0.7
    ): boolean => {
      if (!targetText) return false;

      const searchLower = searchTerm.toLowerCase();
      const targetLower = targetText.toLowerCase();

      if (targetLower.includes(searchLower)) return true;

      const searchWords = searchLower.split(" ").filter((w) => w.length > 2);
      const targetWords = targetLower.split(" ");

      for (const searchWord of searchWords) {
        for (const targetWord of targetWords) {
          if (searchWord.length <= 3) {
            if (targetWord.includes(searchWord)) return true;
            continue;
          }

          const distance = levenshteinDistance(searchWord, targetWord);
          const similarity =
            1 - distance / Math.max(searchWord.length, targetWord.length);

          if (similarity >= threshold) return true;

          if (targetWord.length >= searchWord.length) {
            for (let i = 0; i <= targetWord.length - searchWord.length; i++) {
              const substring = targetWord.substring(i, i + searchWord.length);
              const subDistance = levenshteinDistance(searchWord, substring);
              const subSimilarity = 1 - subDistance / searchWord.length;
              if (subSimilarity >= threshold) return true;
            }
          }
        }
      }

      return false;
    },
    []
  );

  const searchProducts = useCallback(
    (term: string) => {
      if (!term) {
        setFilteredProducts(productos);
        return;
      }

      const termLower = term.toLowerCase();

      const filtered = productos.filter((p: Product) => {
        if (
          p.nombre?.toLowerCase().includes(termLower) ||
          p.descripcion?.toLowerCase().includes(termLower) ||
          p.categoria?.toLowerCase().includes(termLower) ||
          p.codigo?.toLowerCase().includes(termLower)
        ) {
          return true;
        }

        if (
          fuzzyMatch(termLower, p.nombre, 0.6) ||
          fuzzyMatch(termLower, p.descripcion, 0.7) ||
          fuzzyMatch(termLower, p.categoria, 0.7) ||
          fuzzyMatch(termLower, p.codigo, 0.8)
        ) {
          return true;
        }

        const words = termLower.split(" ").filter((w) => w.length > 1);
        if (words.length > 1) {
          return words.every(
            (word: string) =>
              p.nombre?.toLowerCase().includes(word) ||
              p.descripcion?.toLowerCase().includes(word) ||
              p.categoria?.toLowerCase().includes(word)
          );
        }

        return false;
      });

      filtered.sort((a: Product, b: Product) => {
        const aExactScore =
          (a.nombre?.toLowerCase().includes(termLower) ? 2 : 0) +
          (a.descripcion?.toLowerCase().includes(termLower) ? 1 : 0) +
          (a.categoria?.toLowerCase().includes(termLower) ? 1 : 0) +
          (a.codigo?.toLowerCase().includes(termLower) ? 3 : 0);

        const bExactScore =
          (b.nombre?.toLowerCase().includes(termLower) ? 2 : 0) +
          (b.descripcion?.toLowerCase().includes(termLower) ? 1 : 0) +
          (b.categoria?.toLowerCase().includes(termLower) ? 1 : 0) +
          (b.codigo?.toLowerCase().includes(termLower) ? 3 : 0);

        return bExactScore - aExactScore;
      });

      setFilteredProducts(filtered);
    },
    [productos, fuzzyMatch]
  );

  const loadCompras = useCallback(async () => {
    try {
      const res = await fetch(`${API_URLS.MS3}/compras/listar`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setCompras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading purchases:", error);
    }
  }, [token]);

  const createProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URLS.MS2}/productos/crear`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productForm,
          precio: parseFloat(productForm.precio),
          cantidad: parseInt(productForm.cantidad),
        }),
      });

      const data = await res.json();

      if (
        res.ok &&
        (data.mensaje?.includes("exitosamente") ||
          data.mensaje?.includes("creado"))
      ) {
        addNotification("¡Producto creado exitosamente!", "success");
        setResponse(
          JSON.stringify({ mensaje: "¡Producto creado exitosamente!" }, null, 2)
        );
        loadProductos(0, false);
        setProductForm({
          codigo: "",
          nombre: "",
          descripcion: "",
          precio: "",
          cantidad: "",
          categoria: "",
        });
        // Clear success message after 3 seconds
        setTimeout(() => setResponse(""), 3000);
      } else {
        const errorMsg =
          data.mensaje || data.error || "Error al crear producto";
        addNotification(errorMsg, "error");
        setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
      }
    } catch (error) {
      const errorMsg = `Error de conexión: ${error}`;
      addNotification(errorMsg, "error");
      setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
    }
    setLoading(false);
  };

  // Function to modify a product
  const modifyProduct = async (product: Product) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URLS.MS2}/productos/modificar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: product.codigo,
          nombre: product.nombre,
          descripcion: product.descripcion,
          precio: product.precio,
          cantidad: product.cantidad,
          categoria: product.categoria,
        }),
      });

      const data = await res.json();

      if (
        res.ok &&
        (data.mensaje?.includes("exitosamente") ||
          data.mensaje?.includes("modificado") ||
          data.mensaje?.includes("actualizado"))
      ) {
        addNotification("¡Producto modificado exitosamente!", "success");
        setResponse(
          JSON.stringify(
            { mensaje: "¡Producto modificado exitosamente!" },
            null,
            2
          )
        );
        loadProductos(0, false);
        setShowEditModal(false);
        setEditingProduct(null);
        // Clear success message after 3 seconds
        setTimeout(() => setResponse(""), 3000);
      } else {
        const errorMsg =
          data.mensaje || data.error || "Error al modificar producto";
        addNotification(errorMsg, "error");
        setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
      }
    } catch (error) {
      const errorMsg = `Error de conexión: ${error}`;
      addNotification(errorMsg, "error");
      setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
    }
    setLoading(false);
  };

  // Function to delete a product
  const deleteProduct = async (codigo: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URLS.MS2}/productos/eliminar`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigo,
        }),
      });

      const data = await res.json();

      if (
        res.ok &&
        (data.mensaje?.includes("exitosamente") ||
          data.mensaje?.includes("eliminado") ||
          data.mensaje?.includes("correctamente"))
      ) {
        addNotification("¡Producto eliminado exitosamente!", "success");
        setResponse(
          JSON.stringify(
            { mensaje: "¡Producto eliminado exitosamente!" },
            null,
            2
          )
        );
        loadProductos(0, false);
        setShowDeleteModal(false);
        setProductToDelete(null);
        // Clear success message after 3 seconds
        setTimeout(() => setResponse(""), 3000);
      } else {
        const errorMsg =
          data.mensaje || data.error || "Error al eliminar producto";
        addNotification(errorMsg, "error");
        setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
      }
    } catch (error) {
      const errorMsg = `Error de conexión: ${error}`;
      addNotification(errorMsg, "error");
      setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
    }
    setLoading(false);
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingItem = cart.find(
      (item: CartItem) => item.codigo === product.codigo
    );
    if (existingItem) {
      setCart(
        cart.map((item: CartItem) =>
          item.codigo === product.codigo
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, cantidad: quantity }]);
    }
  };

  // Handle edit product modal
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Handle delete product modal
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingProduct(null);
    setProductToDelete(null);
  };

  const removeFromCart = (codigo: string) => {
    setCart(cart.filter((item: CartItem) => item.codigo !== codigo));
  };

  const updateCartQuantity = (codigo: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(codigo);
    } else {
      setCart(
        cart.map((item: CartItem) =>
          item.codigo === codigo ? { ...item, cantidad: newQuantity } : item
        )
      );
    }
  };

  const realizarCompra = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URLS.MS3}/compras/registrar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productos: cart.map((item: CartItem) => ({
            codigo: item.codigo,
            cantidad: item.cantidad,
          })),
        }),
      });

      const data = await res.json();

      if (
        res.ok &&
        (data.mensaje?.includes("registrada") ||
          data.mensaje?.includes("exitosamente"))
      ) {
        setResponse(
          JSON.stringify(
            { mensaje: "¡Compra realizada exitosamente!" },
            null,
            2
          )
        );
        setCart([]);
        loadCompras();
        loadProductos(0, false);
        // Clear success message after 3 seconds
        setTimeout(() => setResponse(""), 3000);
      } else {
        const errorMsg =
          data.mensaje || data.error || "Error al procesar la compra";
        setResponse(JSON.stringify({ mensaje: errorMsg }, null, 2));
      }
    } catch (error) {
      setResponse(
        JSON.stringify({ mensaje: `Error de conexión: ${error}` }, null, 2)
      );
    }
    setLoading(false);
  };

  // Effects
  useEffect(() => {
    searchProducts(searchTerm);
  }, [searchTerm, searchProducts]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCompras();
    }
  }, [isAuthenticated, loadCompras]);

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {currentView === "landing" && (
        <LandingPage onNavigateToApp={() => setCurrentView("login")} />
      )}

      {currentView === "login" && (
        <LoginScreen
          userId={userId}
          setUserId={setUserId}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleLogin={handleLogin}
          loading={loading}
          setCurrentView={setCurrentView}
          setResponse={setResponse}
          response={response}
        />
      )}

      {currentView === "register" && (
        <RegisterScreen
          userId={userId}
          setUserId={setUserId}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          name={name}
          setName={setName}
          tenantId={tenantId}
          setTenantId={setTenantId}
          handleCreateUser={handleCreateUser}
          loading={loading}
          setCurrentView={setCurrentView}
          setResponse={setResponse}
          response={response}
        />
      )}

      {currentView === "dashboard" && (
        <div className="min-h-screen">
          <DashboardHeader userInfo={userInfo} handleLogout={handleLogout} />
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === "productos" && (
              <div className="space-y-6">
                <SearchSection
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filteredProducts={filteredProducts}
                  setSelectedProduct={setSelectedProduct}
                  addToCart={addToCart}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                />

                <ProductForm
                  productForm={productForm}
                  setProductForm={setProductForm}
                  createProduct={createProduct}
                  loading={loading}
                />

                <ProductList
                  productos={productos}
                  addToCart={addToCart}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  loadMoreProducts={loadMoreProducts}
                />
              </div>
            )}

            {activeTab === "compras" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CartSection
                  cart={cart}
                  updateCartQuantity={updateCartQuantity}
                  removeFromCart={removeFromCart}
                  realizarCompra={realizarCompra}
                  loading={loading}
                />
                <ComprasSection compras={compras} />
              </div>
            )}
          </main>

          {/* Product Modal */}
          {selectedProduct && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedProduct(null)}
            >
              <div
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {selectedProduct.nombre}
                  </h3>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <Icons.X />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <p className="text-slate-300">
                    <span className="text-slate-400">Code:</span>{" "}
                    {selectedProduct.codigo}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-400">Description:</span>{" "}
                    {selectedProduct.descripcion}
                  </p>
                  <p className="text-emerald-400 text-lg font-semibold">
                    ${selectedProduct.precio}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-400">Stock:</span>{" "}
                    <span
                      className={
                        selectedProduct.cantidad > 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {selectedProduct.cantidad}
                    </span>
                  </p>
                  <p className="text-blue-400">{selectedProduct.categoria}</p>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.cantidad <= 0}
                  className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Icons.ShoppingCart />
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {showEditModal && editingProduct && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeModals}
            >
              <div
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-lg w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Icons.Edit />
                    Edit Product
                  </h3>
                  <button
                    onClick={closeModals}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <Icons.X />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6">
                  <input
                    placeholder="Product Code"
                    value={editingProduct.codigo}
                    disabled
                    className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-slate-400 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm cursor-not-allowed"
                  />
                  <input
                    placeholder="Product Name"
                    value={editingProduct.nombre}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        nombre: e.target.value,
                      })
                    }
                    className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                  <input
                    placeholder="Description"
                    value={editingProduct.descripcion}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        descripcion: e.target.value,
                      })
                    }
                    className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Price"
                      value={editingProduct.precio}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          precio: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={editingProduct.cantidad}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          cantidad: parseInt(e.target.value) || 0,
                        })
                      }
                      className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                    />
                  </div>
                  <input
                    placeholder="Category"
                    value={editingProduct.categoria}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoria: e.target.value,
                      })
                    }
                    className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModals}
                    className="flex-1 bg-slate-500/20 text-slate-400 py-3 px-4 rounded-xl font-medium hover:bg-slate-500/30 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => modifyProduct(editingProduct)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? <LoadingSpinner /> : <Icons.Save />}
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Product Modal */}
          {showDeleteModal && productToDelete && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeModals}
            >
              <div
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Icons.Trash />
                    Delete Product
                  </h3>
                  <button
                    onClick={closeModals}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <Icons.X />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-slate-300 mb-4">
                    Are you sure you want to delete this product? This action
                    cannot be undone.
                  </p>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <h4 className="text-red-400 font-medium mb-2">
                      {productToDelete.nombre}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Code: {productToDelete.codigo}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Price: ${productToDelete.precio}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModals}
                    className="flex-1 bg-slate-500/20 text-slate-400 py-3 px-4 rounded-xl font-medium hover:bg-slate-500/30 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteProduct(productToDelete.codigo)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? <LoadingSpinner /> : <Icons.Trash />}
                    {loading ? "Deleting..." : "Delete Product"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Response Modal */}
          {response && (
            <div className="fixed bottom-4 right-4 max-w-md w-full z-50">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">System Response</h4>
                  <button
                    onClick={() => setResponse("")}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Icons.X />
                  </button>
                </div>
                <pre className="text-xs text-slate-300 bg-black/20 rounded-lg p-3 overflow-auto max-h-32 font-mono">
                  {response}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notification System */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
          duration={notification.duration}
        />
      ))}
    </div>
  );
}

export default App;
