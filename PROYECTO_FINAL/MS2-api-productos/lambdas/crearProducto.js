// Usando AWS SDK v3 - Mejores prácticas 2025
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

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

export const crearProducto = async (event) => {
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

    // Validar campos requeridos
    if (!codigo || !nombre || !precio) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          mensaje: "Campos requeridos: codigo, nombre, precio",
        }),
      };
    }

    // Crear el producto con tenant_id para Grupo 3
    const producto = {
      codigo,
      nombre,
      descripcion: descripcion || "",
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad) || 0,
      tenant_id: "grupo3", // Hardcoded para Grupo 3
      fechaCreacion: new Date().toISOString(),
      categoria: "Electrónicos", // Categoría del Grupo 3
    };

    // Usar AWS SDK v3 command pattern
    const command = new PutCommand({
      TableName: tableName,
      Item: producto,
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Producto creado exitosamente - Grupo 3",
        producto: producto,
      }),
    };
  } catch (error) {
    console.error("Error al crear producto:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        mensaje: "Error al crear producto",
        detalle: error.message,
      }),
    };
  }
};
