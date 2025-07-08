const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { validarToken } = require('../middleware/validarToken');

module.exports.listarProductos = async (event) => {
  // Intentamos validar el token, pero no lo hacemos obligatorio
  let userId = null;
  let tenantId = null;

  const validacion = await validarToken(event.headers);
  if (validacion.ok) {
    userId = validacion.datos.user_id;
    tenantId = validacion.datos.tenant_id;
  }

  const limit = event.queryStringParameters?.limit
    ? parseInt(event.queryStringParameters.limit)
    : 5;

  const startKey = event.queryStringParameters?.startKey
    ? JSON.parse(decodeURIComponent(event.queryStringParameters.startKey))
    : undefined;

  const soloMios = event.queryStringParameters?.soloMios === 'true';

  if (!tenantId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ mensaje: 'Token requerido para listar productos de tu tenant' })
    };
  }

  const params = {
    TableName: process.env.PRODUCTOS_TABLE,
    Limit: limit,
    FilterExpression: 'tenant_id = :tid',
    ExpressionAttributeValues: {
      ':tid': tenantId
    }
  };

  if (soloMios) {
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ mensaje: 'Token requerido para ver tus productos' })
      };
    }

    // Agregar filtro por user_id también
    params.FilterExpression += ' AND user_id = :uid';
    params.ExpressionAttributeValues[':uid'] = userId;
  }

  if (startKey) {
    params.ExclusiveStartKey = startKey;
  }

  const data = await dynamodb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: data.Items,
      nextPageToken: data.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(data.LastEvaluatedKey))
        : null
    })
  };
};
