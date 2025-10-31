//modulo necesario para tokens
const jwt = require("jsonwebtoken");

//define el token ,
function verificarToken(req, res, next) {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Acceso denegado. Token no proporcionado." }); //error por ausencia
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "clave_secreta" //Comprueba si el token es válido y lo decodifica,
    );
    req.usuarioId = decoded.id; //guarda id del usuario autenticado
    next(); //Continúa con la ejecución de la ruta siguiente
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

//exporta el middleware para usarlo
module.exports = verificarToken;
