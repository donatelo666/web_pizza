//importacion de modulos principales, router , middlewares, database y express validator
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { body, validationResult } = require("express-validator");

//ruta de registro , sanitizacion
router.post(
  "/register",
  [
    body("nombre").trim().escape().isLength({ min: 4 }),
    body("password").isLength({ min: 4 }),
  ],
  async (req, res) => {
    const { nombre, password } = req.body;
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ error: "Datos inválidos" }); //error por mala insercion de datos
    }

    try {
      // Normaliza el nombre para evitar duplicados por mayúsculas o espacios
      const nombreNormalizado = nombre.trim().toLowerCase();

      // Verifica si el usuario ya existe
      const [existe] = await db.query(
        "SELECT id FROM usuarios WHERE LOWER(nombre) = ?",
        [nombreNormalizado]
      );
      if (existe.length > 0) {
        return res.status(409).json({ error: "El usuario ya está registrado" }); //error
      }

      // Encripta la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserta el nuevo usuario
      const [result] = await db.query("INSERT INTO usuarios SET ?", {
        nombre: nombreNormalizado,
        password: hashedPassword,
        rol: "cliente", //rol
      });

      return res.status(200).json({ mensaje: "Registro exitoso" }); //respuesta
    } catch (error) {
      return res.status(500).json({ error: "Error al registrar" });
    }
  }
);

//ruta login, sanitizacion, validacion de datos(mensaje)
router.post(
  "/login",
  [
    body("nombre").trim().escape().isLength({ min: 4 }),
    body("password").isLength({ min: 4 }),
  ],
  async (req, res) => {
    const { nombre, password } = req.body;
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    try {
      // Normaliza el nombre para evitar errores por mayúsculas o espacios
      const nombreNormalizado = nombre.trim().toLowerCase();

      const [results] = await db.query(
        "SELECT * FROM usuarios WHERE LOWER(nombre) = ?",
        [nombreNormalizado]
      );

      if (results.length === 0) {
        console.log("Usuario no encontrado");
        return res.status(401).json({ error: "Usuario no encontrado" }); //verificacion por valor
      }

      const usuario = results[0];

      const match = await bcrypt.compare(password, usuario.password); //compara el password

      if (!match) {
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrectos" }); //no hace match el password
      }

      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        process.env.JWT_SECRET || "clave_secreta",
        { expiresIn: "1h" }
      ); //pone el token

      // Enviar el token como cookie segura
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 3600000, // 1 hora
      });

      return res.status(200).json({ token }); //respuesta
    } catch (error) {
      return res.status(500).json({ error: "Error en el login" });
    }
  }
);

//exporta router para activar las rutas
module.exports = router;
