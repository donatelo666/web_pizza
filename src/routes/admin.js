const express = require("express");
const router = express.Router();
const db = require("../config/database");
const verificarToken = require("../middleware/verificartoken");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

//ruta para ver la pestaña panel con verificacion de token
router.get("/panel", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT rol FROM usuarios WHERE id = ?", [
      req.usuarioId,
    ]);
    const usuario = rows[0];

    console.log("Usuario ID desde token:", req.usuarioId);
    console.log("Rol recibido:", usuario?.rol);

    if (!usuario || usuario.rol.trim() !== "admin") {
      return res.status(403).send("Acceso denegado");
    }

    res.render("admin/panel"); // Vista EJS del panel
  } catch (err) {
    console.error("Error en /admin/panel:", err);
    res.status(500).send("Error interno al verificar acceso");
  }
});

//ruta para ver promos con verificacion de admin , muestra las pizzas del menu con opcion de editar
//agregar nuevas
router.get("/promos", verificarToken, async (req, res) => {
  const [rows] = await db.query("SELECT rol FROM usuarios WHERE id = ?", [
    req.usuarioId,
  ]);
  const usuario = rows[0];

  if (!usuario || usuario.rol.trim() !== "admin") {
    return res.status(403).send("Acceso denegado");
  }

  const [pizzas] = await db.query("SELECT * FROM pizzas");
  res.render("admin/promos", { pizzas });
});

// Actualizar pizza
router.post("/promos/actualizar", upload.single("imagen"), async (req, res) => {
  const { pizzaId, nombre, ingredientes, imagenActual } = req.body;
  const nuevaImagen = req.file ? `/uploads/${req.file.filename}` : imagenActual;

  try {
    await db.query(
      "UPDATE pizzas SET nombre = ?, ingredientes = ?, ruta_imagen = ? WHERE id = ?",
      [nombre, ingredientes, nuevaImagen, pizzaId]
    );
    res.status(200).json({ mensaje: "Pizza actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar la pizza" });
  }
});

router.post("/promos/crear", async (req, res) => {
  const ruta_imagen = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.ruta_imagen;
  const { nombre, ingredientes } = req.body;

  try {
    await db.query(
      "INSERT INTO pizzas (nombre, ingredientes, ruta_imagen) VALUES (?, ?, ?)",
      [nombre, ingredientes, ruta_imagen]
    );

    res.status(200).json({ mensaje: "Pizza creada correctamente" });
  } catch (err) {
    console.error("Error al crear pizza:", err);
    res.status(500).json({ error: "Error al crear la pizza" });
  }
});

module.exports = router;
