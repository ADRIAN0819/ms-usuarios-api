import React, { useState, useEffect, useCallback } from "react";
import LandingPage from "./LandingPage";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import Notification from "./components/Notification";
import ManageProducts from "./components/ManageProducts";
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
  Settings: () => (
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
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Filter: () => (
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
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
      />
    </svg>
  ),
  DollarSign: () => (
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
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
            <p className="text-sm font-medium text-white">
              {userInfo.name || userInfo.user_id}
            </p>
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

// Modern Scrolling Banner Component
const ScrollingBanner: React.FC = () => {
  const messages = [
    "🚀 Multi-tenant E-commerce Platform",
    "⚡ Real-time Product Search",
    "🔒 Secure Authentication System",
    "📱 Modern Responsive Design",
    "💳 Instant Cart Management",
    "🎯 Smart Product Filtering",
    "🌟 TechStore - Your Digital Marketplace",
    "🔍 Advanced Search with Fuzzy Matching",
    "💼 Professional Multi-tenant Architecture",
    "🛒 Seamless Shopping Experience",
    "📊 Dynamic Price Filtering",
    "🎨 Beautiful Modern UI/UX",
    "⚙️ Efficient Product Management",
    "🔐 JWT Token Security",
    "🌐 Cloud-based Infrastructure",
    "💡 Innovation in E-commerce",
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-emerald-600/20 backdrop-blur-xl border-b border-white/10 overflow-hidden">
      <div className="relative h-10 flex items-center">
        <div className="animate-scroll flex items-center space-x-8 whitespace-nowrap">
          {/* Render messages twice for seamless loop */}
          {[...messages, ...messages].map((message, index) => (
            <span
              key={index}
              className="text-white/80 text-sm font-medium px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm"
            >
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modern Best Sellers Carousel Component
const BestSellersCarousel: React.FC<{
  products: Product[];
  onProductClick: (product: Product) => void;
  addToCart: (product: Product) => void;
}> = ({ products, onProductClick, addToCart }) => {
  // Filter products with price > 600
  const bestSellers = products.filter(
    (product) => parseFloat(product.precio.toString()) > 600
  );

  if (bestSellers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">Best Sellers</h3>
          <span className="text-sm text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full">
            Premium Products
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex space-x-4 animate-carousel"
            style={{
              animation: "carousel 360s linear infinite",
              width: "max-content",
            }}
          >
            {/* Render products multiple times for seamless loop */}
            {[...bestSellers, ...bestSellers, ...bestSellers].map(
              (product, index) => (
                <div
                  key={`${product.codigo}-${index}`}
                  className="flex-shrink-0 w-80 bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer group hover:scale-105"
                  onClick={() => onProductClick(product)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-yellow-400 font-medium">
                        BEST SELLER
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-3 h-3 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2">
                    {product.nombre}
                  </h4>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-emerald-400 font-bold text-xl">
                      ${product.precio}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Stock:</span>
                      <span
                        className={`text-xs font-medium ${
                          product.cantidad > 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {product.cantidad}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-400 bg-blue-400/20 px-2 py-1 rounded-full">
                      {product.categoria}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      disabled={product.cantidad <= 0}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                    >
                      <Icons.ShoppingCart />
                      Add
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Last Chance Carousel Component
const LastChanceCarousel: React.FC<{
  products: Product[];
  onProductClick: (product: Product) => void;
  addToCart: (product: Product) => void;
}> = ({ products, onProductClick, addToCart }) => {
  // Debug: Log all products received
  console.log("All products received:", products.length);
  console.log("Products with quantities:", products.map(p => ({ 
    nombre: p.nombre, 
    cantidad: p.cantidad, 
    codigo: p.codigo 
  })));

  // Filter products with quantity < 15 and remove duplicates by codigo
  const lastChanceProducts = products.filter(
    (product, index, self) => 
      product.cantidad < 15 && 
      product.cantidad > 0 && 
      self.findIndex(p => p.codigo === product.codigo) === index
  );

  console.log("Products with quantity < 15:", lastChanceProducts.length);
  console.log("Last chance products:", lastChanceProducts.map(p => ({ 
    nombre: p.nombre, 
    cantidad: p.cantidad,
    codigo: p.codigo 
  })));

  if (lastChanceProducts.length === 0) {
    return null;
  }

  // Don't repeat if we have enough products
  const carouselProducts = lastChanceProducts.length >= 8 
    ? lastChanceProducts
    : [...lastChanceProducts, ...lastChanceProducts];

  return (
    <div className="bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center animate-pulse">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              ¡Última Oportunidad!
            </h3>
            <p className="text-sm text-orange-300">
              Limited stock - buy before its too late!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400 bg-red-400/20 px-3 py-1 rounded-full animate-pulse">
              🔥 LIMITED OFFER
            </span>
            <span className="text-xs text-orange-400 bg-orange-400/20 px-3 py-1 rounded-full">
              ⏰ LAST UNITS
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex space-x-4 animate-lastchance"
            style={{
              animation: "lastchance 180s linear infinite",
              width: "max-content",
            }}
          >
            {/* Render unique products with controlled repetition */}
            {carouselProducts.map(
              (product, index) => (
                <div
                  key={`${product.codigo}-${index}`}
                  className="flex-shrink-0 w-80 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-500/30 hover:border-red-400/60 transition-all duration-300 cursor-pointer group hover:scale-105 relative overflow-hidden"
                  onClick={() => onProductClick(product)}
                >
                  {/* Urgency indicator */}
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                    ¡Only {product.cantidad} left!
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-400 font-medium">
                        LAST CHANCE
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">🚨</span>
                      <span className="text-xs text-orange-400 font-bold">
                        LOW STOCK
                      </span>
                    </div>
                  </div>

                  <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
                    {product.nombre}
                  </h4>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm line-through">
                        $
                        {(
                          parseFloat(product.precio.toString()) *
                          1.2
                        ).toFixed(2)}
                      </span>
                      <span className="text-red-400 font-bold text-xl">
                        ${product.precio}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Stock:</span>
                      <span className="text-xs font-medium text-red-400 animate-pulse">
                        {product.cantidad}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-400 bg-blue-400/20 px-2 py-1 rounded-full">
                      {product.categoria}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      disabled={product.cantidad <= 0}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 animate-pulse"
                    >
                      <Icons.ShoppingCart />
                      ¡Add Now!
                    </button>
                  </div>

                  {/* Progress bar showing stock level */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Stock available</span>
                      <span>{product.cantidad}/15</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(product.cantidad / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Navigation Tabs
const NavigationTabs: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCreateProduct: () => void;
  showCreateProductView: boolean;
  setShowCreateProductView: (show: boolean) => void;
  showManageProducts: boolean;
  setShowManageProducts: (show: boolean) => void;
}> = ({
  activeTab,
  setActiveTab,
  onCreateProduct,
  showCreateProductView,
  setShowCreateProductView,
  showManageProducts,
  setShowManageProducts,
}) => (
  <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === "productos" && !showCreateProductView && !showManageProducts
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white hover:border-slate-300"
            }`}
            onClick={() => {
              setActiveTab("productos");
              setShowCreateProductView(false);
              setShowManageProducts(false);
            }}
          >
            <Icons.Package />
            Products
          </button>
          
          <button
            onClick={onCreateProduct}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              showCreateProductView
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white hover:border-slate-300"
            }`}
          >
            <Icons.Plus />
            Create New Product
          </button>
          
          <button
            onClick={() => {
              setShowManageProducts(true);
              setShowCreateProductView(false);
              setActiveTab("manage");
            }}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              showManageProducts
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-slate-400 hover:text-white hover:border-slate-300"
            }`}
          >
            <Icons.Settings />
            Manage Your Products
          </button>
          
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === "compras" && !showCreateProductView && !showManageProducts
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white hover:border-slate-300"
            }`}
            onClick={() => {
              setActiveTab("compras");
              setShowCreateProductView(false);
              setShowManageProducts(false);
            }}
          >
            <Icons.ShoppingCart />
            Shopping
          </button>
        </div>
      </div>
    </div>
  </nav>
);

// Create Product View Component
const CreateProductView: React.FC<{
  productForm: ProductForm;
  setProductForm: (form: ProductForm) => void;
  createProduct: () => void;
  loading: boolean;
  onBack: () => void;
}> = ({ productForm, setProductForm, createProduct, loading, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Product</h1>
        <p className="text-slate-400">Add a new product to the shop</p>
      </div>

      {/* Form */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Product Code *</label>
            <input
              placeholder="Enter product code"
              value={productForm.codigo}
              onChange={(e) =>
                setProductForm({ ...productForm, codigo: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Product Name *</label>
            <input
              placeholder="Enter product name"
              value={productForm.nombre}
              onChange={(e) =>
                setProductForm({ ...productForm, nombre: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              placeholder="Enter product description"
              value={productForm.descripcion}
              onChange={(e) =>
                setProductForm({ ...productForm, descripcion: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={productForm.precio}
                onChange={(e) =>
                  setProductForm({ ...productForm, precio: e.target.value })
                }
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Quantity *</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={productForm.cantidad}
              onChange={(e) =>
                setProductForm({ ...productForm, cantidad: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <input
              placeholder="Enter product category"
              value={productForm.categoria}
              onChange={(e) =>
                setProductForm({ ...productForm, categoria: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-500/20 text-slate-400 rounded-xl font-medium hover:bg-slate-500/30 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={createProduct}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
          >
            {loading ? <LoadingSpinner /> : <Icons.Plus />}
            {loading ? "Creating Product..." : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Modern Category Bar
const CategoryBar: React.FC<{
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showPriceFilter: boolean;
  setShowPriceFilter: (show: boolean) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  onPriceFilterApply: () => void;
  onPriceFilterClear: () => void;
  priceFilterActive: boolean;
}> = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  showPriceFilter, 
  setShowPriceFilter, 
  minPrice, 
  setMinPrice, 
  maxPrice, 
  setMaxPrice, 
  onPriceFilterApply, 
  onPriceFilterClear, 
  priceFilterActive 
}) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icons.Package />
        <h3 className="text-lg font-semibold text-white">Product Categories</h3>
      </div>
      
      <div className="flex items-center gap-2">
        {priceFilterActive && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
            Price Filter Active
          </span>
        )}
        <button
          onClick={() => setShowPriceFilter(!showPriceFilter)}
          className={`p-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
            showPriceFilter || priceFilterActive
              ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg"
              : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
          }`}
          title="Filter by Price"
        >
          <Icons.DollarSign />
          <Icons.Filter />
        </button>
      </div>
    </div>

    {showPriceFilter && (
      <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Icons.DollarSign />
          <h4 className="text-white font-medium">Price Range Filter</h4>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex items-center text-slate-400 mt-5">
            <span className="text-sm">to</span>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Max Price</label>
            <input
              type="number"
              placeholder="∞"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={onPriceFilterApply}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 font-medium"
          >
            Apply Filter
          </button>
          <button
            onClick={onPriceFilterClear}
            className="flex-1 bg-slate-500/20 text-slate-400 py-2 px-4 rounded-lg text-sm hover:bg-slate-500/30 transition-all duration-200 font-medium"
          >
            Clear Filter
          </button>
        </div>
      </div>
    )}
    
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onCategoryChange("all")}
        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
          selectedCategory === "all"
            ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
            : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
        }`}
      >
        <Icons.Package />
        All Products
      </button>
      
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
            selectedCategory === category
              ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg"
              : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
    
    {categories.length === 0 && (
      <div className="text-center py-4">
        <p className="text-slate-400 text-sm">No categories available</p>
      </div>
    )}
  </div>
);

// Modern Search Section
const SearchSection: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: Product[];
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  searchLoading: boolean;
  handleSearchChange: (term: string) => void;
}> = ({
  searchTerm,
  setSearchTerm,
  filteredProducts,
  setSelectedProduct,
  addToCart,
  searchLoading,
  handleSearchChange,
}) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Icons.Search />
        Smart Product Search
        <span className="text-sm font-normal text-slate-400">
          (Fuzzy matching & Real-time search)
        </span>
      </h3>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
          {searchLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent"></div>
          ) : (
            <Icons.Search />
          )}
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              handleSearchChange("");
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <Icons.X />
          </button>
        )}
      </div>
    </div>

    {searchTerm && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            {searchLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                Searching database...
              </span>
            ) : (
              `Found ${filteredProducts.length} products`
            )}
          </span>
          {filteredProducts.length > 0 && !searchLoading && (
            <span className="text-xs text-emerald-400">
              Real-time search active
            </span>
          )}
        </div>

        {!searchLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.map((product: Product) => (
              <div
                key={product.codigo}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm group flex flex-col h-full"
              >
                <div className="flex-1">
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
                  <p className="text-slate-300 text-sm line-clamp-3 mb-4">
                    {product.descripcion}
                  </p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      // Add view animation
                      const button = document.activeElement as HTMLButtonElement;
                      if (button) {
                        button.classList.add('view-animation');
                        setTimeout(() => {
                          button.classList.remove('view-animation');
                        }, 600);
                      }
                    }}
                    className="flex-1 bg-blue-500/20 text-blue-400 py-2 px-3 rounded-lg text-sm hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center gap-1 font-medium transform hover:scale-105 active:scale-95 btn-animate"
                  >
                    <Icons.Eye />
                    View
                  </button>
                  <button
                    onClick={() => {
                      addToCart(product);
                      // Add cart animation
                      const button = document.activeElement as HTMLButtonElement;
                      if (button) {
                        button.classList.add('cart-add-animation');
                        setTimeout(() => {
                          button.classList.remove('cart-add-animation');
                        }, 500);
                      }
                    }}
                    disabled={product.cantidad <= 0}
                    className="flex-1 bg-emerald-500/20 text-emerald-400 py-2 px-3 rounded-lg text-sm hover:bg-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium transform hover:scale-105 active:scale-95 btn-animate"
                  >
                    <Icons.ShoppingCart />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searchLoading && filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">No products found</div>
            <div className="text-sm text-slate-500">
              Try a different search term or check your spelling
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

// Modern Category Products Section
const CategoryProductsSection: React.FC<{
  selectedCategory: string;
  categoryProducts: Product[];
  categoryHasMore: boolean;
  categoryLoadingMore: boolean;
  loadMoreCategoryProducts: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  setSelectedProduct: (product: Product | null) => void;
}> = ({
  selectedCategory,
  categoryProducts,
  categoryHasMore,
  categoryLoadingMore,
  loadMoreCategoryProducts,
  addToCart,
  onEditProduct,
  onDeleteProduct,
  setSelectedProduct,
}) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
        <Icons.Package />
        {selectedCategory === "all" ? "All Products" : `${selectedCategory} Products`}
      </h3>
      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
        {categoryProducts.length} loaded
      </span>
    </div>

    {categoryProducts.length === 0 ? (
      <div className="text-center py-12">
        <Icons.Package />
        <p className="text-slate-400 mt-4">No products found in this category</p>
        <p className="text-sm text-slate-500 mt-2">
          Try selecting a different category or create new products
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoryProducts.map((product: Product) => (
            <div
              key={product.codigo}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm group flex flex-col h-full"
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                    {product.nombre}
                  </h4>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p className="text-slate-400 line-clamp-2">
                    {product.descripcion}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 font-semibold">
                      ${product.precio}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.cantidad > 0 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      Stock: {product.cantidad}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">
                      Code: {product.codigo}
                    </span>
                    <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full">
                      {product.categoria}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    // Add view animation
                    const button = document.activeElement as HTMLButtonElement;
                    if (button) {
                      button.classList.add('view-animation');
                      setTimeout(() => {
                        button.classList.remove('view-animation');
                      }, 600);
                    }
                  }}
                  className="flex-1 bg-blue-500/20 text-blue-400 py-2 px-3 rounded-lg text-sm hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center gap-1 font-medium transform hover:scale-105 active:scale-95 btn-animate"
                >
                  <Icons.Eye />
                  View
                </button>
                <button
                  onClick={() => {
                    addToCart(product);
                    // Add cart animation
                    const button = document.activeElement as HTMLButtonElement;
                    if (button) {
                      button.classList.add('cart-add-animation');
                      setTimeout(() => {
                        button.classList.remove('cart-add-animation');
                      }, 500);
                    }
                  }}
                  disabled={product.cantidad <= 0}
                  className="flex-1 bg-emerald-500/20 text-emerald-400 py-2 px-3 rounded-lg text-sm hover:bg-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium transform hover:scale-105 active:scale-95 btn-animate"
                >
                  <Icons.ShoppingCart />
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {categoryHasMore && (
          <div className="text-center">
            <button
              onClick={loadMoreCategoryProducts}
              disabled={categoryLoadingMore}
              className="bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mx-auto shadow-lg"
            >
              {categoryLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  Loading...
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
      </div>
    )}
  </div>
);

// Modern Product Form Modal
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
        className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-slate-400 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
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
    name: "",
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

  // Category states
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryOffset, setCategoryOffset] = useState(0);
  const [categoryHasMore, setCategoryHasMore] = useState(true);
  const [categoryLoadingMore, setCategoryLoadingMore] = useState(false);

  // Price filter states
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceFilterActive, setPriceFilterActive] = useState(false);

  // Constants
  const PAGE_SIZE = 12;

  // Product editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Shopping cart states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);

  // Estados adicionales para la búsqueda
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // General states
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("productos");
  const [showCreateProductView, setShowCreateProductView] = useState(false);
  const [showManageProducts, setShowManageProducts] = useState(false);

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
      console.log("Login response:", data); // Debug log

      // Check if login was successful
      if (res.ok && data.token) {
        // Use the user_id from the form since the API doesn't return it
        const welcomeName = userId; // Use the user_id that was used for login
        addNotification(`¡Bienvenido, ${welcomeName}!`, "success", 3000);
        setToken(data.token);
        
        // Get user info
        const userInfoData = await getUserInfo(userId, data.token);
        setUserInfo(userInfoData);
        
        setIsAuthenticated(true);
        setCurrentView("dashboard");
        // Reset category state when logging in
        setSelectedCategory("all");
        setCategoryOffset(0);
        setCategoryHasMore(true);
        loadAllProducts(); // Load ALL products for carousels
        // Load initial category products
        loadProductsByCategory("all", 0, false);
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
    setUserInfo({ user_id: "", tenant_id: "", name: "" });
    setIsAuthenticated(false);
    setCurrentView("login");
    setCart([]);
    setProductos([]);
    setCompras([]);
    setCategoryProducts([]);
    setCategories([]);
    setSelectedCategory("all");
    setResponse(""); // Clear any previous error messages
    // Clear sensitive form data
    setUserId("");
    setPassword("");
    setShowPassword(false);
    setName("");
    setTenantId("");
    // Reset pagination state
    setCategoryOffset(0);
    setCategoryHasMore(true);
    setCategoryLoadingMore(false);
  };

  // Load ALL products for carousels (not paginated)
  const loadAllProducts = async () => {
    try {
      let allProducts: Product[] = [];
      let offset = 0;
      let hasMore = true;
      const limit = 50;

      while (hasMore && offset < 1000) { // Safety limit
        const url = `${API_URLS.MS2}/productos/listar?limit=${limit}&offset=${offset}`;
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (data.productos && data.productos.length > 0) {
          allProducts = [...allProducts, ...data.productos];
          offset += limit;
          hasMore = data.productos.length === limit;
        } else {
          hasMore = false;
        }
      }

      console.log("Loaded all products:", allProducts.length);
      setProductos(allProducts);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(allProducts.map(p => p.categoria))];
      setCategories(uniqueCategories);
      
      return allProducts;
    } catch (error) {
      console.error("Error loading all products:", error);
      return [];
    }
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
          // Solo actualizar filteredProducts si no hay búsqueda activa
          if (!searchTerm) {
            setFilteredProducts(data.productos);
          }
        }

        // Update pagination info for general products (not used in new implementation)
        // const hasMoreProducts = data.pagination?.hasMore || false;
        // const nextOffset = data.pagination?.nextOffset || offset + PAGE_SIZE;

        // Extraer categorías únicas
        const allProducts = append ? [...productos, ...data.productos] : data.productos;
        extractCategories(allProducts);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // Función para extraer categorías únicas
  const extractCategories = (productList: Product[]) => {
    const uniqueCategories = Array.from(
      new Set(productList.map(p => p.categoria).filter(Boolean))
    ).sort();
    setCategories(uniqueCategories);
  };

  // Función para cargar productos por categoría
  const loadProductsByCategory = async (category: string, offset = 0, append = false) => {
    try {
      // Si es "all", cargar todos los productos
      if (category === "all") {
        const url = `${API_URLS.MS2}/productos/listar?limit=${PAGE_SIZE}&offset=${offset}`;
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (data.productos) {
          let productsToShow = data.productos;
          
          // Apply price filter if active
          if (priceFilterActive) {
            productsToShow = applyPriceFilter(productsToShow);
          }
          
          if (append) {
            setCategoryProducts((prev) => [...prev, ...productsToShow]);
          } else {
            setCategoryProducts(productsToShow);
          }

          const hasMoreProducts = data.pagination?.hasMore || false;
          const nextOffset = data.pagination?.nextOffset || offset + PAGE_SIZE;

          setCategoryHasMore(hasMoreProducts);
          setCategoryOffset(nextOffset);
        }
      } else {
        // Cargar productos de una categoría específica
        // Primero obtenemos todos los productos de esa categoría
        let allCategoryProducts: Product[] = [];
        let searchOffset = 0;
        let hasMore = true;
        const searchLimit = 50;

        while (hasMore && searchOffset < 500) {
          const url = `${API_URLS.MS2}/productos/listar?limit=${searchLimit}&offset=${searchOffset}`;
          const res = await fetch(url, {
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();

          if (data.productos && data.productos.length > 0) {
            const categoryFilteredProducts = data.productos.filter(
              (p: Product) => p.categoria === category
            );
            allCategoryProducts = [...allCategoryProducts, ...categoryFilteredProducts];
            searchOffset += searchLimit;
            hasMore = data.productos.length === searchLimit;
          } else {
            hasMore = false;
          }
        }

        // Aplicar paginación manual
        let finalProducts = allCategoryProducts;
        
        // Apply price filter if active
        if (priceFilterActive) {
          finalProducts = applyPriceFilter(finalProducts);
        }
        
        const startIndex = append ? categoryProducts.length : offset;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedProducts = finalProducts.slice(startIndex, endIndex);

        if (append) {
          setCategoryProducts((prev) => [...prev, ...paginatedProducts]);
        } else {
          setCategoryProducts(paginatedProducts);
        }

        setCategoryHasMore(endIndex < finalProducts.length);
        setCategoryOffset(endIndex);
      }
    } catch (error) {
      console.error("Error loading products by category:", error);
    }
  };

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCategoryOffset(0);
    setCategoryHasMore(true);
    setCategoryLoadingMore(false);
    loadProductsByCategory(category, 0, false);
  };

  // Función para cargar más productos de la categoría actual
  const loadMoreCategoryProducts = async () => {
    if (categoryLoadingMore || !categoryHasMore) return;

    setCategoryLoadingMore(true);
    await loadProductsByCategory(selectedCategory, categoryOffset, true);
    setCategoryLoadingMore(false);
  };

  // Nueva función para buscar productos en la base de datos
  const searchProductsInDatabase = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      let productsToShow = productos;
      
      // Apply price filter if active
      if (priceFilterActive) {
        productsToShow = applyPriceFilter(productsToShow);
      }
      
      setFilteredProducts(productsToShow);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    try {
      // Hacer múltiples solicitudes para obtener todos los productos
      let allProducts: Product[] = [];
      let offset = 0;
      let hasMore = true;
      const limit = 50; // Aumentar el límite para obtener más productos por consulta

      while (hasMore && offset < 500) { // Límite de seguridad para evitar bucles infinitos
        const url = `${API_URLS.MS2}/productos/listar?limit=${limit}&offset=${offset}`;
        
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (data.productos && data.productos.length > 0) {
          allProducts = [...allProducts, ...data.productos];
          offset += limit;
          hasMore = data.productos.length === limit; // Si obtuvimos menos productos que el límite, no hay más
        } else {
          hasMore = false;
        }
      }

      // Aplicar búsqueda fuzzy local a todos los productos obtenidos
      let searchResults = applyFuzzySearch(searchTerm, allProducts);
      
      // Apply price filter if active
      if (priceFilterActive) {
        searchResults = applyPriceFilter(searchResults);
      }
      
      setFilteredProducts(searchResults);
      
    } catch (error) {
      console.error("Error searching products:", error);
      // Fallback a búsqueda local si falla la búsqueda en BD
      let localResults = applyFuzzySearch(searchTerm, productos);
      
      // Apply price filter if active
      if (priceFilterActive) {
        localResults = applyPriceFilter(localResults);
      }
      
      setFilteredProducts(localResults);
    } finally {
      setSearchLoading(false);
    }
  };

  // Función para manejar la búsqueda con debounce
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    
    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!term) {
      setFilteredProducts(productos);
      setSearchLoading(false);
      return;
    }

    // Mostrar indicador de carga inmediatamente
    setSearchLoading(true);

    // Configurar nuevo timeout
    const newTimeout = setTimeout(() => {
      searchProductsInDatabase(term);
    }, 300); // 300ms de debounce

    setSearchTimeout(newTimeout);
  };

  // Función separada para aplicar búsqueda fuzzy
  const applyFuzzySearch = (term: string, productList: Product[]) => {
    const termLower = term.toLowerCase();

    const filtered = productList.filter((p: Product) => {
      // Búsqueda exacta primero
      if (
        p.nombre?.toLowerCase().includes(termLower) ||
        p.descripcion?.toLowerCase().includes(termLower) ||
        p.categoria?.toLowerCase().includes(termLower) ||
        p.codigo?.toLowerCase().includes(termLower)
      ) {
        return true;
      }

      // Búsqueda fuzzy
      if (
        fuzzyMatch(termLower, p.nombre, 0.6) ||
        fuzzyMatch(termLower, p.descripcion, 0.7) ||
        fuzzyMatch(termLower, p.categoria, 0.7) ||
        fuzzyMatch(termLower, p.codigo, 0.8)
      ) {
        return true;
      }

      // Búsqueda por palabras múltiples
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

    // Ordenar por relevancia
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

    return filtered;
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
        // Reload category products if we're viewing a specific category
        if (selectedCategory !== "all") {
          loadProductsByCategory(selectedCategory, 0, false);
        } else {
          loadProductsByCategory("all", 0, false);
        }
        setProductForm({
          codigo: "",
          nombre: "",
          descripcion: "",
          precio: "",
          cantidad: "",
          categoria: "",
        });
        setShowCreateProductView(false);
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
        // Reload category products
        loadProductsByCategory(selectedCategory, 0, false);
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
        // Reload category products
        loadProductsByCategory(selectedCategory, 0, false);
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
    
    // Show animated notification
    addNotification(
      `✅ ${product.nombre} añadido correctamente al carrito de compras`,
      "success",
      2000
    );
  };

  // Handle create product view
  const handleCreateProduct = () => {
    setShowCreateProductView(true);
  };

  // Handle back to products
  const handleBackToProducts = () => {
    setShowCreateProductView(false);
    setShowManageProducts(false);
  };

  const handleBackFromManageProducts = () => {
    setShowManageProducts(false);
    setActiveTab("productos");
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

  // Function to get user info from database
  const getUserInfo = async (userIdParam: string, token: string) => {
    try {
      // First try to validate the token to get basic info
      const validateRes = await fetch(`${API_URLS.MS1}/usuarios/validar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
        }),
      });
      
      if (validateRes.ok) {
        const validateData = await validateRes.json();
        console.log("Validate response:", validateData); // Debug log
        return {
          user_id: validateData.user_id || userIdParam,
          tenant_id: validateData.tenant_id || "",
          name: validateData.name || userIdParam // Use user_id as fallback
        };
      }
    } catch (error) {
      console.error("Error getting user info:", error);
    }
    
    // Fallback
    return {
      user_id: userIdParam,
      tenant_id: "",
      name: userIdParam
    };
  };

  // Effects
  useEffect(() => {
    // Limpiar timeout al cambiar de componente
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCompras();
    }
  }, [isAuthenticated, loadCompras]);

  // Price filter functions
  const applyPriceFilter = (productList: Product[]) => {
    if (!priceFilterActive) return productList;

    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;

    return productList.filter((product) => {
      const price = parseFloat(product.precio.toString());
      return price >= min && price <= max;
    });
  };

  const handlePriceFilterApply = () => {
    setPriceFilterActive(true);
    setShowPriceFilter(false);
    // Recargar productos con filtro de precio
    loadProductsByCategory(selectedCategory, 0, false);
  };

  const handlePriceFilterClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setPriceFilterActive(false);
    setShowPriceFilter(false);
    // Recargar productos sin filtro de precio
    loadProductsByCategory(selectedCategory, 0, false);
  };

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
          <ScrollingBanner />
          <NavigationTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onCreateProduct={handleCreateProduct}
            showCreateProductView={showCreateProductView}
            setShowCreateProductView={setShowCreateProductView}
            showManageProducts={showManageProducts}
            setShowManageProducts={setShowManageProducts}
          />

          {showCreateProductView ? (
            <CreateProductView
              productForm={productForm}
              setProductForm={setProductForm}
              createProduct={createProduct}
              loading={loading}
              onBack={handleBackToProducts}
            />
          ) : showManageProducts ? (
            <ManageProducts
              token={token}
              onBack={handleBackFromManageProducts}
              addNotification={addNotification}
              API_URLS={API_URLS}
              userInfo={userInfo}
            />
          ) : (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeTab === "productos" && (
                <div className="space-y-6">
                  <SearchSection
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredProducts={filteredProducts}
                    setSelectedProduct={setSelectedProduct}
                    addToCart={addToCart}
                    searchLoading={searchLoading}
                    handleSearchChange={handleSearchChange}
                  />

                  <BestSellersCarousel
                    products={productos}
                    onProductClick={setSelectedProduct}
                    addToCart={addToCart}
                  />

                  <LastChanceCarousel
                    products={productos}
                    onProductClick={setSelectedProduct}
                    addToCart={addToCart}
                  />

                  <CategoryBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    showPriceFilter={showPriceFilter}
                    setShowPriceFilter={setShowPriceFilter}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    onPriceFilterApply={handlePriceFilterApply}
                    onPriceFilterClear={handlePriceFilterClear}
                    priceFilterActive={priceFilterActive}
                  />

                  <CategoryProductsSection
                    selectedCategory={selectedCategory}
                    categoryProducts={categoryProducts}
                    categoryHasMore={categoryHasMore}
                    categoryLoadingMore={categoryLoadingMore}
                    loadMoreCategoryProducts={loadMoreCategoryProducts}
                    addToCart={addToCart}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                    setSelectedProduct={setSelectedProduct}
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
          )}

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