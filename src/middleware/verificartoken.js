const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "clave_secreta"
    );
    req.usuarioId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

module.exports = verificarToken;
