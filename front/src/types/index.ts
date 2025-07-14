// Interfaces para el sistema de usuarios multi-tenant

export interface UserInfo {
  user_id: string;
  tenant_id: string;
}

export interface Product {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  categoria: string;
}

export interface CartItem extends Product {
  cantidad: number; // Cantidad en el carrito (override)
}

export interface ProductoCompra {
  codigo: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Compra {
  compra_id?: string;
  fecha: string;
  productos?: ProductoCompra[];
}

export interface ProductForm {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  cantidad: string;
  categoria: string;
}

// Props interfaces for components
export interface LoginScreenProps {
  userId: string;
  setUserId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  handleLogin: () => void;
  loading: boolean;
  setCurrentView: (view: string) => void;
  setResponse: (response: string) => void;
  response: string;
}

export interface RegisterScreenProps {
  userId: string;
  setUserId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  name: string;
  setName: (value: string) => void;
  tenantId: string;
  setTenantId: (value: string) => void;
  handleCreateUser: () => void;
  loading: boolean;
  setCurrentView: (view: string) => void;
  setResponse: (response: string) => void;
  response: string;
}

export interface DashboardHeaderProps {
  userInfo: UserInfo;
  handleLogout: () => void;
}

export interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface SearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: Product[];
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
}

export interface ProductFormProps {
  productForm: ProductForm;
  setProductForm: (form: ProductForm) => void;
  createProduct: () => void;
  loading: boolean;
}

export interface CartSectionProps {
  cart: CartItem[];
  updateCartQuantity: (codigo: string, newQuantity: number) => void;
  removeFromCart: (codigo: string) => void;
  realizarCompra: () => void;
  loading: boolean;
}

export interface ComprasSectionProps {
  compras: Compra[];
}

// Notification system interfaces
export interface NotificationData {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}
