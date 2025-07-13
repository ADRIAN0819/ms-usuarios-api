const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de clientes ElasticSearch por tenant
const elasticClients = {
  'empresa_postman': new Client({ node: 'http://localhost:9200' }),
  'empresa_test': new Client({ node: 'http://localhost:9201' })
};

// Función para obtener cliente ElasticSearch por tenant
const getElasticClient = (tenantId) => {
  return elasticClients[tenantId] || null;
};

// Función para obtener nombre del índice
const getIndexName = (type, tenantId) => {
  return `${type}-${tenantId}`;
};

// =========== ENDPOINTS PARA PRODUCTOS ===========

// Indexar producto en ElasticSearch
app.post('/api/elasticsearch/:tenantId/productos', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const producto = req.body;
    
    const client = getElasticClient(tenantId);
    if (!client) {
      return res.status(400).json({ error: 'Tenant no configurado' });
    }
    
    const indexName = getIndexName('productos', tenantId);
    
    const response = await client.index({
      index: indexName,
      id: producto.codigo,
      body: {
        ...producto,
        tenant_id: tenantId,
        fecha_indexacion: new Date().toISOString()
      }
    });
    
    res.json({
      success: true,
      message: 'Producto indexado en ElasticSearch',
      response: response
    });
    
  } catch (error) {
    console.error('Error indexando producto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar productos con búsqueda avanzada
app.post('/api/elasticsearch/:tenantId/productos/search', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { query, filters = {}, size = 10, from = 0 } = req.body;
    
    const client = getElasticClient(tenantId);
    if (!client) {
      return res.status(400).json({ error: 'Tenant no configurado' });
    }
    
    const indexName = getIndexName('productos', tenantId);
    
    // Construir query ElasticSearch
    let searchQuery = {
      index: indexName,
      body: {
        size,
        from,
        query: {
          bool: {
            must: [],
            filter: []
          }
        },
        highlight: {
          fields: {
            nombre: {},
            descripcion: {},
            categoria: {}
          }
        }
      }
    };
    
    // Añadir búsqueda de texto si existe
    if (query && query.trim()) {
      searchQuery.body.query.bool.must.push({
        multi_match: {
          query: query,
          fields: ['nombre^3', 'descripcion^2', 'categoria^1', 'codigo^4'],
          type: 'best_fields',
          fuzziness: 'AUTO',
          operator: 'or'
        }
      });
    } else {
      searchQuery.body.query.bool.must.push({ match_all: {} });
    }
    
    // Añadir filtros
    if (filters.categoria) {
      searchQuery.body.query.bool.filter.push({
        term: { categoria: filters.categoria }
      });
    }
    
    if (filters.precio_min || filters.precio_max) {
      const rangeFilter = { range: { precio: {} } };
      if (filters.precio_min) rangeFilter.range.precio.gte = filters.precio_min;
      if (filters.precio_max) rangeFilter.range.precio.lte = filters.precio_max;
      searchQuery.body.query.bool.filter.push(rangeFilter);
    }
    
    // Filtro por tenant
    searchQuery.body.query.bool.filter.push({
      term: { tenant_id: tenantId }
    });
    
    const response = await client.search(searchQuery);
    
    res.json({
      success: true,
      total: response.body.hits.total.value,
      productos: response.body.hits.hits.map(hit => ({
        ...hit._source,
        _score: hit._score,
        highlight: hit.highlight
      }))
    });
    
  } catch (error) {
    console.error('Error buscando productos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Autocompletado de productos
app.get('/api/elasticsearch/:tenantId/productos/autocomplete', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const client = getElasticClient(tenantId);
    if (!client) {
      return res.status(400).json({ error: 'Tenant no configurado' });
    }
    
    const indexName = getIndexName('productos', tenantId);
    
    const response = await client.search({
      index: indexName,
      body: {
        size: 5,
        _source: ['nombre', 'codigo', 'categoria'],
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: q,
                  fields: ['nombre^3', 'codigo^2', 'categoria'],
                  type: 'phrase_prefix'
                }
              }
            ],
            filter: [
              { term: { tenant_id: tenantId } }
            ]
          }
        }
      }
    });
    
    const suggestions = response.body.hits.hits.map(hit => ({
      text: hit._source.nombre,
      code: hit._source.codigo,
      category: hit._source.categoria
    }));
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('Error en autocompletado:', error);
    res.status(500).json({ error: error.message });
  }
});

// =========== ENDPOINTS PARA COMPRAS ===========

// Indexar compra en ElasticSearch
app.post('/api/elasticsearch/:tenantId/compras', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const compra = req.body;
    
    const client = getElasticClient(tenantId);
    if (!client) {
      return res.status(400).json({ error: 'Tenant no configurado' });
    }
    
    const indexName = getIndexName('compras', tenantId);
    
    const response = await client.index({
      index: indexName,
      id: compra.compra_id,
      body: {
        ...compra,
        tenant_id: tenantId,
        fecha_indexacion: new Date().toISOString()
      }
    });
    
    res.json({
      success: true,
      message: 'Compra indexada en ElasticSearch',
      response: response
    });
    
  } catch (error) {
    console.error('Error indexando compra:', error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar compras
app.post('/api/elasticsearch/:tenantId/compras/search', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { user_id, fecha_desde, fecha_hasta, size = 10, from = 0 } = req.body;
    
    const client = getElasticClient(tenantId);
    if (!client) {
      return res.status(400).json({ error: 'Tenant no configurado' });
    }
    
    const indexName = getIndexName('compras', tenantId);
    
    let searchQuery = {
      index: indexName,
      body: {
        size,
        from,
        query: {
          bool: {
            filter: [
              { term: { tenant_id: tenantId } }
            ]
          }
        },
        sort: [
          { fecha: { order: 'desc' } }
        ]
      }
    };
    
    // Filtros adicionales
    if (user_id) {
      searchQuery.body.query.bool.filter.push({
        term: { user_id: user_id }
      });
    }
    
    if (fecha_desde || fecha_hasta) {
      const rangeFilter = { range: { fecha: {} } };
      if (fecha_desde) rangeFilter.range.fecha.gte = fecha_desde;
      if (fecha_hasta) rangeFilter.range.fecha.lte = fecha_hasta;
      searchQuery.body.query.bool.filter.push(rangeFilter);
    }
    
    const response = await client.search(searchQuery);
    
    res.json({
      success: true,
      total: response.body.hits.total.value,
      compras: response.body.hits.hits.map(hit => hit._source)
    });
    
  } catch (error) {
    console.error('Error buscando compras:', error);
    res.status(500).json({ error: error.message });
  }
});

// =========== ENDPOINTS DE SALUD ===========

// Verificar estado de ElasticSearch
app.get('/api/elasticsearch/:tenantId/health', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const client = getElasticClient(tenantId);
    if (!client) {
      return res.status(400).json({ error: 'Tenant no configurado' });
    }
    
    const health = await client.cluster.health();
    const info = await client.info();
    
    res.json({
      tenant: tenantId,
      cluster_health: health.body,
      elasticsearch_info: info.body
    });
    
  } catch (error) {
    console.error('Error verificando salud:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar índices del tenant
app.get('/api/elasticsearch/:tenantId/indices', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const client = getElasticClient(tenantId);
    if (!client) {
      return res.status(400).json({ error: 'Tenant no configurado' });
    }
    
    const indices = await client.cat.indices({ format: 'json' });
    
    // Filtrar índices del tenant
    const tenantIndices = indices.body.filter(index => 
      index.index.includes(tenantId)
    );
    
    res.json({
      tenant: tenantId,
      indices: tenantIndices
    });
    
  } catch (error) {
    console.error('Error listando índices:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API ElasticSearch Multi-Tenant ejecutándose en puerto ${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   POST /api/elasticsearch/:tenantId/productos`);
  console.log(`   POST /api/elasticsearch/:tenantId/productos/search`);
  console.log(`   GET  /api/elasticsearch/:tenantId/productos/autocomplete`);
  console.log(`   POST /api/elasticsearch/:tenantId/compras`);
  console.log(`   POST /api/elasticsearch/:tenantId/compras/search`);
  console.log(`   GET  /api/elasticsearch/:tenantId/health`);
  console.log(`   GET  /api/elasticsearch/:tenantId/indices`);
});
