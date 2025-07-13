// Usando AWS SDK v3 - Mejores prácticas 2025
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { validarToken } from "../middleware/validarToken.js";

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

export const eliminarProducto = async (event) => {
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
    // Validar token de autenticación
    const tokenValidation = await validarToken(event.headers);
    if (!tokenValidation.ok) {
      const errorResponse = tokenValidation.respuesta;
      errorResponse.headers = corsHeaders;
      return errorResponse;
    }

    const tokenData = tokenValidation.datos;

    // Acceder a variables de entorno de forma segura
    const tableName = process.env.PRODUCTOS_TABLE;
    if (!tableName) {
      throw new Error("PRODUCTOS_TABLE environment variable is not set");
    }

    // Parsear el body del request
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Body del request requerido",
        }),
      };
    }

    const { codigo } = JSON.parse(event.body);

    // Validar que el código esté presente
    if (!codigo) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Código de producto requerido",
        }),
      };
    }

    // Verificar que el producto existe y es del Grupo 3 antes de eliminarlo
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { codigo },
    });

    const existingData = await docClient.send(getCommand);

    if (!existingData.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Producto no encontrado",
        }),
      };
    }

    if (existingData.Item.tenant_id !== tokenData.tenant_id) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "No autorizado para eliminar este producto",
        }),
      };
    }

    // Usar AWS SDK v3 command pattern para eliminar
    const deleteCommand = new DeleteCommand({
      TableName: tableName,
      Key: { codigo },
      ReturnValues: "ALL_OLD",
    });

    const result = await docClient.send(deleteCommand);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Producto eliminado exitosamente - Grupo 3",
        productoEliminado: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Error al eliminar producto",
        detalle: error.message,
      }),
    };
  }
};
