// Usando AWS SDK v3 - Mejores prácticas 2025
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// Inicializar cliente fuera del handler para reutilización
const dynamoClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Headers CORS según estándares 2025
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export const listarProductos = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

  // Manejar requests OPTIONS para CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "CORS preflight OK" }),
    };
  }

  try {
    // Acceder a variables de entorno de forma segura
    const tableName = process.env.PRODUCTOS_TABLE;
    if (!tableName) {
      throw new Error("PRODUCTOS_TABLE environment variable is not set");
    }

    // Obtener parámetros de consulta para paginación
    const queryParams = event.queryStringParameters || {};
    const limit = queryParams.limit ? parseInt(queryParams.limit) : null;
    const offset = queryParams.offset ? parseInt(queryParams.offset) : 0;

    // Validar límites
    if (limit && (limit < 1 || limit > 100)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "El límite debe estar entre 1 y 100",
        }),
      };
    }

    // Configurar comando de DynamoDB - necesitamos obtener TODOS los elementos para hacer paginación manual
    const commandParams = {
      TableName: tableName,
    };

    // Para paginación correcta, necesitamos obtener todos los elementos
    // porque DynamoDB no soporta offset nativo
    const command = new ScanCommand(commandParams);
    const data = await docClient.send(command);

    // Obtener todos los productos
    let allProductos = data.Items || [];
    const totalCount = allProductos.length;

    // Aplicar paginación manual
    let productos = allProductos;
    
    // Aplicar offset
    if (offset > 0) {
      productos = productos.slice(offset);
    }
    
    // Aplicar limit
    if (limit) {
      productos = productos.slice(0, limit);
    }

    // Calcular información de paginación
    const hasMore = limit ? (offset + limit) < totalCount : false;
    const nextOffset = offset + (limit || 0);

    // Preparar respuesta con información de paginación
    const response = {
      productos: productos,
      count: productos.length,
      totalCount: totalCount,
      message: "Productos listados exitosamente - Grupo 3",
    };

    // Agregar información de paginación si se usó
    if (limit || offset > 0) {
      response.pagination = {
        limit: limit || totalCount,
        offset: offset,
        hasMore: hasMore,
        nextOffset: nextOffset
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error al listar productos:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Error al listar productos",
        detalle: error.message,
      }),
    };
  }
};
