// Usando AWS SDK v3 - Compatible con el resto del proyecto
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const validarToken = async (headers) => {
  let token = headers['x-auth-token'] || headers['authorization'] || headers['Authorization'];

  if (!token) {
    return {
      ok: false,
      respuesta: {
        statusCode: 401,
        body: JSON.stringify({ mensaje: 'Token no proporcionado' })
      }
    };
  }

  // Remover prefijo "Bearer " si lo tiene
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  try {
    const tableName = process.env.TOKENS_TABLE;

    const command = new GetCommand({
      TableName: tableName,
      Key: { token }
    });

    const res = await docClient.send(command);

    if (!res.Item) {
      return {
        ok: false,
        respuesta: {
          statusCode: 403,
          body: JSON.stringify({ mensaje: 'Token no existe' })
        }
      };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    if (now > res.Item.expires) {
      return {
        ok: false,
        respuesta: {
          statusCode: 403,
          body: JSON.stringify({ mensaje: 'Token expirado' })
        }
      };
    }

    return {
      ok: true,
      datos: res.Item // Incluye user_id, tenant_id, etc.
    };
  } catch (err) {
    return {
      ok: false,
      respuesta: {
        statusCode: 500,
        body: JSON.stringify({ mensaje: 'Error al validar token', detalle: err.message })
      }
    };
  }
};
