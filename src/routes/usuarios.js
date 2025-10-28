const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

router.get("/usuarios", verificarToken, async (req, res) => {
  const [admin] = await db.query("SELECT rol FROM usuarios WHERE id = ?", [
    req.usuarioId,
  ]);
  if (admin.length === 0 || admin[0].rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const [usuarios] = await db.query("SELECT id, nombre, rol FROM usuarios");
  res.render("admin", { usuarios });
});
