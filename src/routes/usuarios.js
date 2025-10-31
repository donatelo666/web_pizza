//modulo principal , router y mysql
const express = require("express");
const router = express.Router();
const db = require("../config/database");

//ruta renderiza ususarios , y la info para la tabla de usuarios
router.get("/usuarios", async (req, res) => {
  const [usuarios] = await db.query("SELECT id, nombre, rol FROM usuarios");
  res.render("usuarios", { usuarios });
});

module.exports = router;
