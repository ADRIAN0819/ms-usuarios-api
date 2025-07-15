import React, { useState, useEffect } from 'react';

// Icons
const Icons = {
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Save: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
};

// Loading Spinner
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
);

// Types
interface Product {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  categoria: string;
  tenant_id: string;
  user_id?: string;
  fechaCreacion?: string;
}

interface ProductForm {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  cantidad: string;
  categoria: string;
}

interface ManageProductsProps {
  token: string;
  onBack: () => void;
  addNotification: (message: string, type: 'success' | 'error') => void;
  API_URLS: {
    MS2: string;
  };
  userInfo: {
    user_id: string;
    tenant_id: string;
  };
}

const ManageProducts: React.FC<ManageProductsProps> = ({ 
  token, 
  onBack, 
  addNotification, 
  API_URLS,
  userInfo 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    categoria: ''
  });

  // Load products from tenant
  const loadTenantProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.MS2}/productos/listar`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter products by tenant_id
        const tenantProducts = (data.productos || []).filter(
          (product: Product) => product.tenant_id === userInfo.tenant_id
        );
        setProducts(tenantProducts);
      } else {
        addNotification('Error loading products', 'error');
      }
    } catch (error) {
      addNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    loadTenantProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      codigo: product.codigo,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(),
      cantidad: product.cantidad.toString(),
      categoria: product.categoria
    });
    setShowEditModal(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Update product
  const updateProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.MS2}/productos/modificar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo: editingProduct.codigo,
          nombre: editForm.nombre,
          descripcion: editForm.descripcion,
          precio: parseFloat(editForm.precio),
          cantidad: parseInt(editForm.cantidad),
          categoria: editForm.categoria
        })
      });

      if (response.ok) {
        addNotification('Product updated successfully!', 'success');
        setShowEditModal(false);
        setEditingProduct(null);
        loadTenantProducts();
      } else {
        addNotification('Error updating product', 'error');
      }
    } catch (error) {
      addNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async () => {
    if (!productToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.MS2}/productos/eliminar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo: productToDelete.codigo
        })
      });

      if (response.ok) {
        addNotification('Product deleted successfully!', 'success');
        setShowDeleteModal(false);
        setProductToDelete(null);
        loadTenantProducts();
      } else {
        addNotification('Error deleting product', 'error');
      }
    } catch (error) {
      addNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <Icons.ArrowLeft />
              </button>
              <div className="flex items-center gap-2">
                <Icons.Package />
                <div>
                  <h1 className="text-2xl font-bold text-white">Manage Your Products</h1>
                  <p className="text-sm text-slate-400">Tenant: {userInfo.tenant_id}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
              {products.length} Products
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg mb-6">
          <div className="relative">
            <Icons.Search />
            <input
              type="text"
              placeholder="Search products by name, code, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-2 text-slate-400">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Icons.Package />
              <p className="text-slate-400 mt-4">No products found</p>
              <p className="text-sm text-slate-500 mt-2">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first product to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.codigo}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{product.nombre}</h3>
                      <p className="text-sm text-slate-400 mb-2">{product.codigo}</p>
                      <div className="inline-block bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs font-medium mb-3">
                        {product.categoria}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{product.descripcion}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white">
                      <span className="text-xl font-bold">${product.precio}</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      Stock: {product.cantidad}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-blue-500/20 text-blue-400 py-2 px-3 rounded-lg font-medium hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Icons.Edit />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="flex-1 bg-red-500/20 text-red-400 py-2 px-3 rounded-lg font-medium hover:bg-red-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Icons.Trash />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Product</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <Icons.X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Product Code</label>
                <input
                  value={editForm.codigo}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-slate-400 backdrop-blur-sm opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Product Name</label>
                <input
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.precio}
                  onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
                <input
                  type="number"
                  value={editForm.cantidad}
                  onChange={(e) => setEditForm({ ...editForm, cantidad: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <input
                  value={editForm.categoria}
                  onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-slate-500/20 text-slate-400 py-3 px-4 rounded-xl font-medium hover:bg-slate-500/30 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={updateProduct}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? <LoadingSpinner /> : <Icons.Save />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                <Icons.Trash />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Product</h3>
              <p className="text-slate-400 mb-6">
                Are you sure you want to delete "{productToDelete.nombre}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-slate-500/20 text-slate-400 py-3 px-4 rounded-xl font-medium hover:bg-slate-500/30 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProduct}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? <LoadingSpinner /> : <Icons.Trash />}
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
