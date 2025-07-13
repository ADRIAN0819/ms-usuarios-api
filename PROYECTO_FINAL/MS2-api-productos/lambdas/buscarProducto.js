// Usando AWS SDK v3 - Mejores prácticas 2025
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

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

export const buscarProducto = async (event) => {
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

    // Obtener código del path parameter
    const codigo = event.pathParameters?.codigo;
    if (!codigo) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Código de producto requerido en el path",
        }),
      };
    }

    // Usar AWS SDK v3 command pattern
    const command = new GetCommand({
      TableName: tableName,
      Key: { codigo },
    });

    const data = await docClient.send(command);

    if (!data.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Producto no encontrado",
        }),
      };
    }

    // Filtrar por tenant para Grupo 3
    if (data.Item.tenant_id !== "grupo3") {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Producto no encontrado o no autorizado",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Producto encontrado - Grupo 3",
        producto: data.Item,
      }),
    };
  } catch (error) {
    console.error("Error al buscar producto:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Error al buscar el producto",
        detalle: error.message,
      }),
    };
  }
};
