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

    // Configurar comando de DynamoDB con paginación
    const commandParams = {
      TableName: tableName,
    };

    // Si se especifica limit, agregarlo al comando
    if (limit) {
      commandParams.Limit = limit + offset; // Necesitamos obtener más elementos para poder hacer offset
    }

    const command = new ScanCommand(commandParams);
    const data = await docClient.send(command);

    // Aplicar offset manualmente (DynamoDB no soporta offset nativo)
    let productos = data.Items || [];
    const totalCount = productos.length;

    // Aplicar offset y limit
    if (offset > 0) {
      productos = productos.slice(offset);
    }
    if (limit && productos.length > limit) {
      productos = productos.slice(0, limit);
    }

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
        hasMore: (offset + productos.length) < totalCount,
        nextOffset: offset + productos.length
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
