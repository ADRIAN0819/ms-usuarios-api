// Headers CORS comunes para todas las lambdas de MS2
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Función helper para manejar OPTIONS
const handleOptions = () => {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: "CORS preflight" }),
  };
};

// Función helper para respuestas con CORS
const responseWithCors = (statusCode, body) => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
};

module.exports = {
  corsHeaders,
  handleOptions,
  responseWithCors,
};
