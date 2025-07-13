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

    // Usar AWS SDK v3 command pattern
    const command = new ScanCommand({
      TableName: tableName,
    });

    const data = await docClient.send(command);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        productos: data.Items || [],
        count: data.Items ? data.Items.length : 0,
        message: "Productos listados exitosamente - Grupo 3",
      }),
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
