import { useState, useEffect } from 'react'
import './App.css'

// API URLs
const API_URLS = {
  MS1: 'https://dchblr3rv8.execute-api.us-east-1.amazonaws.com/dev',
  MS2: 'https://d3fhew8l8b.execute-api.us-east-1.amazonaws.com/dev',
  MS3: 'https://bi3zdo4r1c.execute-api.us-east-1.amazonaws.com/dev'
}

// Componentes de interfaz fuera del componente principal para evitar re-renders
const LoginScreen = ({ 
  userId, 
  setUserId, 
  password, 
  setPassword, 
  handleLogin, 
  loading, 
  setCurrentView, 
  response 
}: any) => (
  <div className="auth-container">
    <div className="auth-card">
      <div className="tech-header">
        <h1>🔐 Sistema Multi-Tenancy</h1>
        <p>Plataforma de Gestión de Productos Electrónicos</p>
      </div>
      
      <div className="form-section">
        <input
          type="text"
          placeholder="🆔 User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          type="password"
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="auth-buttons">
        <button onClick={handleLogin} disabled={loading} className="primary-btn">
          {loading ? '⏳ Verificando...' : '🚀 Iniciar Sesión'}
        </button>
        <button onClick={() => setCurrentView('register')} className="secondary-btn">
          📝 Crear Cuenta
        </button>
      </div>

      {response && (
        <div className="response-section">
          <pre className="response-display">{response}</pre>
        </div>
      )}
    </div>
  </div>
)

const RegisterScreen = ({ 
  userId, 
  setUserId, 
  password, 
  setPassword, 
  name, 
  setName, 
  tenantId, 
  setTenantId, 
  handleCreateUser, 
  loading, 
  setCurrentView, 
  response 
}: any) => (
  <div className="auth-container">
    <div className="auth-card">
      <div className="tech-header">
        <h1>⚡ Registro Multi-Tenancy</h1>
        <p>Crear Nueva Cuenta en el Sistema</p>
      </div>
      
      <div className="form-section">
        <input
          type="text"
          placeholder="🆔 User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          type="password"
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="👤 Nombre Completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="🏢 Tenant ID (Empresa)"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
        />
      </div>

      <div className="auth-buttons">
        <button onClick={handleCreateUser} disabled={loading} className="primary-btn">
          {loading ? '⏳ Creando...' : '✅ Registrar'}
        </button>
        <button onClick={() => setCurrentView('login')} className="secondary-btn">
          🔄 Ir a Login
        </button>
      </div>

      {response && (
        <div className="response-section">
          <pre className="response-display">{response}</pre>
        </div>
      )}
    </div>
  </div>
)

const SearchSection = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredProducts, 
  setSelectedProduct, 
  addToCart 
}: any) => (
  <div className="search-section">
    <div className="search-controls">
      <input
        type="text"
        placeholder="🔍 Buscar productos... (Búsqueda inteligente con tolerancia a errores)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
    
    {searchTerm && (
      <div className="search-results">
        <h4>📋 Resultados ({filteredProducts.length}):</h4>
        <div className="products-grid">
          {filteredProducts.map((product: any) => (
            <div key={product.codigo} className="product-card">
              <h5>{product.nombre}</h5>
              <p><strong>Código:</strong> {product.codigo}</p>
              <p><strong>Precio:</strong> ${product.precio}</p>
              <p><strong>Stock:</strong> {product.cantidad}</p>
              <p><strong>Categoría:</strong> {product.categoria}</p>
              <div className="product-actions">
                <button 
                  onClick={() => setSelectedProduct(product)}
                  className="info-btn"
                >
                  👁️ Ver
                </button>
                <button 
                  onClick={() => addToCart(product)}
                  className="cart-btn"
                  disabled={product.cantidad <= 0}
                >
                  🛒 Al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

const ProductForm = ({ 
  productForm, 
  setProductForm, 
  createProduct, 
  loading 
}: any) => (
  <div className="product-form">
    <h3>📦 Crear Nuevo Producto</h3>
    <div className="form-grid">
      <input
        placeholder="📋 Código del Producto"
        value={productForm.codigo}
        onChange={(e) => setProductForm({...productForm, codigo: e.target.value})}
      />
      <input
        placeholder="🏷️ Nombre del Producto"
        value={productForm.nombre}
        onChange={(e) => setProductForm({...productForm, nombre: e.target.value})}
      />
      <input
        placeholder="📝 Descripción"
        value={productForm.descripcion}
        onChange={(e) => setProductForm({...productForm, descripcion: e.target.value})}
      />
      <input
        type="number"
        placeholder="💰 Precio"
        value={productForm.precio}
        onChange={(e) => setProductForm({...productForm, precio: e.target.value})}
      />
      <input
        type="number"
        placeholder="📊 Cantidad"
        value={productForm.cantidad}
        onChange={(e) => setProductForm({...productForm, cantidad: e.target.value})}
      />
      <input
        placeholder="🏷️ Categoría"
        value={productForm.categoria}
        onChange={(e) => setProductForm({...productForm, categoria: e.target.value})}
      />
    </div>
    <button onClick={createProduct} disabled={loading} className="primary-btn">
      {loading ? '⏳ Creando...' : '✅ Crear Producto'}
    </button>
  </div>
)

const CartSection = ({ 
  cart, 
  updateCartQuantity, 
  removeFromCart, 
  realizarCompra, 
  loading 
}: any) => (
  <div className="cart-section">
    <h3>🛒 Carrito de Compras ({cart.length})</h3>
    {cart.length === 0 ? (
      <p>El carrito está vacío</p>
    ) : (
      <>
        <div className="cart-items">
          {cart.map((item: any) => (
            <div key={item.codigo} className="cart-item">
              <span>{item.nombre}</span>
              <div className="quantity-controls">
                <button onClick={() => updateCartQuantity(item.codigo, item.cantidad - 1)}>-</button>
                <span>{item.cantidad}</span>
                <button onClick={() => updateCartQuantity(item.codigo, item.cantidad + 1)}>+</button>
              </div>
              <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              <button onClick={() => removeFromCart(item.codigo)} className="remove-btn">🗑️</button>
            </div>
          ))}
        </div>
        <div className="cart-total">
          <strong>Total: ${cart.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0).toFixed(2)}</strong>
        </div>
        <button onClick={realizarCompra} disabled={loading} className="primary-btn">
          {loading ? '⏳ Procesando...' : '💳 Realizar Compra'}
        </button>
      </>
    )}
  </div>
)

const ComprasSection = ({ compras }: any) => (
  <div className="compras-section">
    <h3>📈 Historial de Compras</h3>
    {compras.length === 0 ? (
      <p>No hay compras registradas</p>
    ) : (
      <div className="compras-list">
        {compras.map((compra: any, index: number) => (
          <div key={compra.compra_id || index} className="compra-card">
            <h4>🧾 Compra #{compra.compra_id?.slice(-8) || index + 1}</h4>
            <p><strong>📅 Fecha:</strong> {compra.fecha}</p>
            <div className="compra-productos">
              {compra.productos?.map((producto: any, i: number) => (
                <div key={i} className="compra-producto">
                  <span>{producto.nombre} x{producto.cantidad}</span>
                  <span>${(producto.precio_unitario * producto.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

function App() {
  // Navegación y autenticación
  const [currentView, setCurrentView] = useState('login') // 'login', 'register', 'dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState('')
  const [userInfo, setUserInfo] = useState({ user_id: '', tenant_id: '' })
  
  // Formularios de usuario
  const [userId, setUserId] = useState('user_test_postman')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('Test User')
  const [tenantId, setTenantId] = useState('empresa_postman')
  
  // Estados de productos
  const [productos, setProductos] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    categoria: ''
  })
  
  // Carrito de compras
  const [cart, setCart] = useState<any[]>([])
  const [compras, setCompras] = useState<any[]>([])
  
  // Estados generales
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [activeTab, setActiveTab] = useState('productos') // 'productos', 'compras'

  // Funciones de autenticación
  const handleCreateUser = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URLS.MS1}/usuarios/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          name: name,
          password: password,
          tenant_id: tenantId
        })
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
      if (data.mensaje?.includes('exitosamente')) {
        setTimeout(() => setCurrentView('login'), 2000)
      }
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URLS.MS1}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          password: password
        })
      })
      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        setUserInfo({ user_id: data.user_id, tenant_id: data.tenant_id })
        setIsAuthenticated(true)
        setCurrentView('dashboard')
        loadProductos()
      }
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    setToken('')
    setUserInfo({ user_id: '', tenant_id: '' })
    setIsAuthenticated(false)
    setCurrentView('login')
    setCart([])
    setProductos([])
    setCompras([])
  }

  // Funciones de productos
  const loadProductos = async () => {
    try {
      const res = await fetch(`${API_URLS.MS2}/productos/listar`, {
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.productos) {
        setProductos(data.productos)
        setFilteredProducts(data.productos)
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
    }
  }

  // Función para calcular distancia de Levenshtein (similitud entre strings)
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Función para búsqueda fuzzy avanzada
  const fuzzyMatch = (searchTerm: string, targetText: string, threshold: number = 0.7): boolean => {
    if (!targetText) return false
    
    const searchLower = searchTerm.toLowerCase()
    const targetLower = targetText.toLowerCase()
    
    // Búsqueda exacta (más relevante)
    if (targetLower.includes(searchLower)) return true
    
    // Búsqueda por palabras individuales
    const searchWords = searchLower.split(' ').filter(w => w.length > 2)
    const targetWords = targetLower.split(' ')
    
    for (const searchWord of searchWords) {
      for (const targetWord of targetWords) {
        // Si la palabra es corta, buscar coincidencia exacta
        if (searchWord.length <= 3) {
          if (targetWord.includes(searchWord)) return true
          continue
        }
        
        // Para palabras más largas, usar distancia de Levenshtein
        const distance = levenshteinDistance(searchWord, targetWord)
        const similarity = 1 - (distance / Math.max(searchWord.length, targetWord.length))
        
        if (similarity >= threshold) return true
        
        // También verificar si la palabra target contiene la búsqueda con errores
        if (targetWord.length >= searchWord.length) {
          for (let i = 0; i <= targetWord.length - searchWord.length; i++) {
            const substring = targetWord.substring(i, i + searchWord.length)
            const subDistance = levenshteinDistance(searchWord, substring)
            const subSimilarity = 1 - (subDistance / searchWord.length)
            if (subSimilarity >= threshold) return true
          }
        }
      }
    }
    
    return false
  }

  const searchProducts = (term: string) => {
    if (!term) {
      setFilteredProducts(productos)
      return
    }

    const termLower = term.toLowerCase()
    
    // Búsqueda inteligente que combina múltiples estrategias
    const filtered = productos.filter((p: any) => {
      // 1. Búsqueda exacta (prioridad alta)
      if (p.nombre?.toLowerCase().includes(termLower) ||
          p.descripcion?.toLowerCase().includes(termLower) ||
          p.categoria?.toLowerCase().includes(termLower) ||
          p.codigo?.toLowerCase().includes(termLower)) {
        return true
      }
      
      // 2. Búsqueda fuzzy para errores tipográficos
      if (fuzzyMatch(termLower, p.nombre, 0.6) ||
          fuzzyMatch(termLower, p.descripcion, 0.7) ||
          fuzzyMatch(termLower, p.categoria, 0.7) ||
          fuzzyMatch(termLower, p.codigo, 0.8)) {
        return true
      }
      
      // 3. Búsqueda por palabras individuales (autocompletado)
      const words = termLower.split(' ').filter(w => w.length > 1)
      if (words.length > 1) {
        return words.every((word: string) => 
          p.nombre?.toLowerCase().includes(word) ||
          p.descripcion?.toLowerCase().includes(word) ||
          p.categoria?.toLowerCase().includes(word)
        )
      }
      
      return false
    })
    
    // Ordenar por relevancia (coincidencias exactas primero)
    filtered.sort((a: any, b: any) => {
      const aExactScore = (a.nombre?.toLowerCase().includes(termLower) ? 2 : 0) +
                         (a.descripcion?.toLowerCase().includes(termLower) ? 1 : 0) +
                         (a.categoria?.toLowerCase().includes(termLower) ? 1 : 0) +
                         (a.codigo?.toLowerCase().includes(termLower) ? 3 : 0)
      
      const bExactScore = (b.nombre?.toLowerCase().includes(termLower) ? 2 : 0) +
                         (b.descripcion?.toLowerCase().includes(termLower) ? 1 : 0) +
                         (b.categoria?.toLowerCase().includes(termLower) ? 1 : 0) +
                         (b.codigo?.toLowerCase().includes(termLower) ? 3 : 0)
      
      return bExactScore - aExactScore
    })
    
    setFilteredProducts(filtered)
  }

  const createProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URLS.MS2}/productos/crear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productForm,
          precio: parseFloat(productForm.precio),
          cantidad: parseInt(productForm.cantidad)
        })
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
      if (data.mensaje?.includes('exitosamente')) {
        loadProductos()
        setProductForm({
          codigo: '',
          nombre: '',
          descripcion: '',
          precio: '',
          cantidad: '',
          categoria: ''
        })
      }
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
    setLoading(false)
  }

  const addToCart = (product: any, quantity = 1) => {
    const existingItem = cart.find((item: any) => item.codigo === product.codigo)
    if (existingItem) {
      setCart(cart.map((item: any) =>
        item.codigo === product.codigo
          ? { ...item, cantidad: item.cantidad + quantity }
          : item
      ))
    } else {
      setCart([...cart, { ...product, cantidad: quantity }])
    }
  }

  const removeFromCart = (codigo: string) => {
    setCart(cart.filter((item: any) => item.codigo !== codigo))
  }

  const updateCartQuantity = (codigo: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(codigo)
    } else {
      setCart(cart.map((item: any) =>
        item.codigo === codigo
          ? { ...item, cantidad: newQuantity }
          : item
      ))
    }
  }

  const realizarCompra = async () => {
    if (cart.length === 0) return
    
    setLoading(true)
    try {
      const res = await fetch(`${API_URLS.MS3}/compras/registrar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productos: cart.map((item: any) => ({
            codigo: item.codigo,
            cantidad: item.cantidad
          }))
        })
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
      if (data.mensaje?.includes('registrada')) {
        setCart([])
        loadCompras()
        loadProductos() // Recargar para actualizar stock
      }
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
    setLoading(false)
  }

  const loadCompras = async () => {
    try {
      const res = await fetch(`${API_URLS.MS3}/compras/listar`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      setCompras(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error cargando compras:', error)
    }
  }

  // Efectos
  useEffect(() => {
    searchProducts(searchTerm)
  }, [searchTerm, productos])

  useEffect(() => {
    if (isAuthenticated) {
      loadCompras()
    }
  }, [isAuthenticated])

  // Renderizado principal
  return (
    <div className="app">
      {currentView === 'login' && (
        <LoginScreen 
          userId={userId}
          setUserId={setUserId}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          loading={loading}
          setCurrentView={setCurrentView}
          response={response}
        />
      )}
      {currentView === 'register' && (
        <RegisterScreen 
          userId={userId}
          setUserId={setUserId}
          password={password}
          setPassword={setPassword}
          name={name}
          setName={setName}
          tenantId={tenantId}
          setTenantId={setTenantId}
          handleCreateUser={handleCreateUser}
          loading={loading}
          setCurrentView={setCurrentView}
          response={response}
        />
      )}
      {currentView === 'dashboard' && (
        <div className="dashboard">
          <div className="dashboard-header">
            <h1>🏢 Panel Multi-Tenancy</h1>
            <div className="user-info">
              <span>👤 {userInfo.user_id} | 🏢 {userInfo.tenant_id}</span>
              <button onClick={handleLogout} className="logout-btn">🚪 Salir</button>
            </div>
          </div>

          <div className="tab-navigation">
            <button 
              className={activeTab === 'productos' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('productos')}
            >
              📦 Gestión de Productos
            </button>
            <button 
              className={activeTab === 'compras' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('compras')}
            >
              🛒 Compras
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'productos' && (
              <div className="productos-tab">
                <SearchSection 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filteredProducts={filteredProducts}
                  setSelectedProduct={setSelectedProduct}
                  addToCart={addToCart}
                />
                <ProductForm 
                  productForm={productForm}
                  setProductForm={setProductForm}
                  createProduct={createProduct}
                  loading={loading}
                />
                <div className="productos-list">
                  <h3>📋 Todos los Productos ({productos.length})</h3>
                  <div className="products-grid">
                    {productos.map((product: any) => (
                      <div key={product.codigo} className="product-card">
                        <h5>{product.nombre}</h5>
                        <p><strong>Código:</strong> {product.codigo}</p>
                        <p><strong>Precio:</strong> ${product.precio}</p>
                        <p><strong>Stock:</strong> {product.cantidad}</p>
                        <p><strong>Categoría:</strong> {product.categoria}</p>
                        <button 
                          onClick={() => addToCart(product)}
                          className="cart-btn"
                          disabled={product.cantidad <= 0}
                        >
                          🛒 Al Carrito
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'compras' && (
              <div className="compras-tab">
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
          </div>

          {selectedProduct && (
            <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>📦 {selectedProduct.nombre}</h3>
                <p><strong>Código:</strong> {selectedProduct.codigo}</p>
                <p><strong>Descripción:</strong> {selectedProduct.descripcion}</p>
                <p><strong>Precio:</strong> ${selectedProduct.precio}</p>
                <p><strong>Stock:</strong> {selectedProduct.cantidad}</p>
                <p><strong>Categoría:</strong> {selectedProduct.categoria}</p>
                <button onClick={() => setSelectedProduct(null)} className="close-btn">✖️</button>
              </div>
            </div>
          )}

          {response && (
            <div className="response-section">
              <h4>📋 Respuesta del Sistema:</h4>
              <pre className="response-display">{response}</pre>
              <button onClick={() => setResponse('')} className="close-response">✖️</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
