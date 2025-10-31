//importa dotenv para seguridad, mysqlpromise
require("dotenv").config();
const mysql = require("mysql2/promise");

//guarda info personal con el .env
const conexion = mysql.createPool({
  host: process.env.host,
  database: process.env.database,
  user: process.env.user,
  password: process.env.password,
});

//  prueba la conexión una vez y envia console log
(async () => {
  try {
    const conn = await conexion.getConnection();
    console.log("✅ Conexión exitosa a MySQL");
    conn.release(); // libera la conexión al pool
  } catch (err) {
    console.error("❌ Error en la conexión con MySQL:", err);
  }
})();

//exporta la conexion para uso
module.exports = conexion;
