require("dotenv").config();
const mysql = require("mysql2/promise");

const conexion = mysql.createPool({
  host: process.env.host,
  database: process.env.database,
  user: process.env.user,
  password: process.env.password,
});

// Opcional: prueba la conexión una vez
(async () => {
  try {
    const conn = await conexion.getConnection();
    console.log("✅ Conexión exitosa a MySQL");
    conn.release(); // libera la conexión al pool
  } catch (err) {
    console.error("❌ Error en la conexión con MySQL:", err);
  }
})();

module.exports = conexion;
