const AWS = require('aws-sdk');
const { validarToken } = require('../middleware/validarToken');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.buscarProducto = async (event) => {
  // Validar token
  const validacion = await validarToken(event.headers);
  if (!validacion.ok) return validacion.respuesta;

  const userId = validacion.datos.user_id;
  const tenantId = validacion.datos.tenant_id;

  const codigo = event.pathParameters.codigo;

  const params = {
    TableName: process.env.PRODUCTOS_TABLE,
    Key: { codigo }
  };

  try {
    const data = await dynamodb.get(params).promise();

    if (!data.Item || data.Item.tenant_id !== tenantId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ mensaje: 'Producto no encontrado o no autorizado' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };
  } catch (err) {
    console.error("Error al buscar producto:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ mensaje: 'Error al buscar el producto', detalle: err.message })
    };
  }
};
