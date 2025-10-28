const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { body, validationResult } = require("express-validator");

console.log("auth.js cargado");

// Registro de usuario
router.post(
  "/register",
  [body("password").isLength({ min: 4 }), body("nombre").trim().escape()],
  async (req, res) => {
    console.log("Entró a /register");
    const { nombre, password } = req.body;
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Ejecutando consulta...");
      const [result] = await db.query("INSERT INTO usuarios SET ?", {
        nombre,
        password: hashedPassword,
        rol: "cliente",
      });
      console.log("Enviando respuesta...");
      return res.status(200).json({ mensaje: "Registro exitoso" });
    } catch (error) {
      console.error("Error en DB:", error);
      return res.status(500).json({ error: "Error al registrar" });
    }
  }
);

// Login de usuario
router.post(
  "/login",
  [body("password").isLength({ min: 4 }), body("nombre").trim().escape()],
  async (req, res) => {
    console.log("Entró a /login");
    const { nombre, password } = req.body;
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    try {
      console.log("Ejecutando consulta...");
      const [results] = await db.query(
        "SELECT * FROM usuarios WHERE nombre = ?",
        [nombre]
      );

      if (results.length === 0) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      console.log("Callback ejecutado");
      const usuario = results[0];
      const match = await bcrypt.compare(password, usuario.password);
      if (!match) {
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrectos" });
      }

      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        "clave_secreta",
        { expiresIn: "1h" }
      );
      console.log("Enviando respuesta...");
      return res.status(200).json({ token });
    } catch (error) {
      console.error("Error en DB:", error);
      return res.status(500).json({ error: "Error en el login" });
    }
  }
);

module.exports = router;
