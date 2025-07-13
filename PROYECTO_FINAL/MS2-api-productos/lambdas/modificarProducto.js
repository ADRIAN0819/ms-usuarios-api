// Usando AWS SDK v3 - Mejores prácticas 2025
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

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

export const modificarProducto = async (event) => {
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

    const { codigo, nombre, descripcion, precio, cantidad } = JSON.parse(
      event.body
    );

    // Validar campo requerido
    if (!codigo) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Código de producto requerido",
        }),
      };
    }

    // Verificar que el producto existe
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { codigo },
    });

    const existingProduct = await docClient.send(getCommand);

    if (!existingProduct.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Producto no encontrado",
        }),
      };
    }

    // Verificar que pertenece al Grupo 3
    if (existingProduct.Item.tenant_id !== "grupo3") {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "No autorizado para modificar este producto",
        }),
      };
    }

    // Construir producto actualizado
    const productoActualizado = {
      ...existingProduct.Item,
      ...(nombre && { nombre }),
      ...(descripcion !== undefined && { descripcion }),
      ...(precio && { precio: parseFloat(precio) }),
      ...(cantidad !== undefined && { cantidad: parseInt(cantidad) }),
      fechaModificacion: new Date().toISOString(),
    };

    // Usar AWS SDK v3 command pattern para actualizar
    const putCommand = new PutCommand({
      TableName: tableName,
      Item: productoActualizado,
    });

    await docClient.send(putCommand);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Producto modificado exitosamente - Grupo 3",
        producto: productoActualizado,
      }),
    };
  } catch (error) {
    console.error("Error al modificar producto:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Error al modificar producto",
        detalle: error.message,
      }),
    };
  }
};
