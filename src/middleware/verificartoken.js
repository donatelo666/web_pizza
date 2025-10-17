//usa el paquete jason web token para los formularios para autenticacion
const jwt = require('jsonwebtoken');
//funcion de verificar token , se entrega en los headers de fetch en los formularios 
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }//error

    try {
        const decoded = jwt.verify(token, 'clave_secreta'); // Usa la misma clave que en login
        req.usuarioId = decoded.id; // ✅ Guarda el ID del usuario para usarlo en las rutas
        next(); // Continúa con la siguiente funcion o ruta 
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
}
// Exporta el middleware para usarlo en rutas protegidas
module.exports = verificarToken;

