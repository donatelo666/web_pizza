const express = require("express");
const router = express.Router();
const db = require("../config/database");
const verificarToken = require("../middleware/verificartoken");
const multer = require("multer");
const path = require("path");

// Configurar almacenamiento de multer en uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/public/uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

//ruta para ver la pestaña panel con verificacion de token
router.get("/panel", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT rol FROM usuarios WHERE id = ?", [
      req.usuarioId,
    ]);
    const usuario = rows[0];

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

// Ruta para crear pizza
router.post("/promos/crear", upload.single("ruta_imagen"), async (req, res) => {
  // 🔥 Ahora req.body y req.file estarán disponibles
  const { nombre, ingredientes } = req.body;
  const ruta_imagen = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre || !ingredientes) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    await db.query(
      "INSERT INTO pizzas (nombre, ingredientes, ruta_imagen) VALUES (?, ?, ?)",
      [nombre, ingredientes, ruta_imagen]
    );
    res.status(200).json({ mensaje: "Pizza creada correctamente ✅" });
  } catch (err) {
    console.error("Error al crear pizza:", err);
    res.status(500).json({ error: "Error al crear la pizza" });
  }
});

//ruta pa ver usuarios
router.get("/usuarios", async (req, res) => {
  try {
    const [usuarios] = await db.query("SELECT * FROM usuarios");

    let usuarioParaEditar = null;
    if (req.query.editar) {
      const [resultado] = await db.query(
        "SELECT * FROM usuarios WHERE id = ?",
        [req.query.editar]
      );
      usuarioParaEditar = resultado[0] || null;
    }

    // 🔥 pasa ambas variables SIEMPRE
    res.render("admin/usuarios", {
      usuarios,
      usuarioParaEditar,
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).send("Error al cargar usuarios");
  }
});

// 🟩 Ruta para editar usuario
router.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, rol } = req.body;

  try {
    await db.query("UPDATE usuarios SET nombre = ?, rol = ? WHERE id = ?", [
      nombre,
      rol,
      id,
    ]);
    res.redirect("/admin/usuarios"); // vuelve al panel
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).send("Error al editar el usuario");
  }
});

//ruta para eliminar usuarios con override
router.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
  res.redirect("/admin/usuarios?eliminado=1"); // ✅ redirige con flag
});

//ruta pa ver ordenes
router.get("/ordenes", async (req, res) => {
  try {
    const [ordenes] = await db.query("SELECT * FROM ordenes");

    let ordenParaEditar = null;
    if (req.query.editar) {
      const [resultado] = await db.query("SELECT * FROM ordenes WHERE id = ?", [
        req.query.editar,
      ]);
      ordenParaEditar = resultado[0] || null;
    }

    // 🔥 pasa varias variables SIEMPRE
    res.render("admin/ordenes", {
      ordenes,
      ordenParaEditar,
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).send("Error al cargar usuarios");
  }
});

// 🟩 Ruta para editar orden
router.put("/ordenes/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, tamano, sabor } = req.body;

  try {
    await db.query(
      "UPDATE ordenes SET nombre = ?, telefono = ?, tamano = ?, sabor = ? WHERE id = ?",
      [nombre, telefono, tamano, sabor, id]
    );
    res.redirect("/admin/ordenes"); // vuelve al panel
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).send("Error al editar el usuario");
  }
});

//ruta para eliminar orden con override
router.delete("/ordenes/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM ordenes WHERE id = ?", [id]);
  res.redirect("/admin/ordenes?eliminado=1"); // ✅ redirige con flag
});

// Mostrar promociones y vista
router.get("/promociones", async (req, res) => {
  const [promociones] = await db.query("SELECT * FROM promociones");
  let promoParaEditar = null;

  if (req.query.editar) {
    const [[promo]] = await db.query("SELECT * FROM promociones WHERE id = ?", [
      req.query.editar,
    ]);
    promoParaEditar = promo;
  }

  res.render("admin/promociones", { promociones, promoParaEditar });
});

// Crear nueva promoción
router.post("/promociones/crear", async (req, res) => {
  const { titulo, descripcion } = req.body;
  await db.query(
    "INSERT INTO promociones (titulo, descripcion) VALUES (?, ?)",
    [titulo, descripcion]
  );
  res.redirect("/admin/promociones?creado=1");
});

// Editar promoción
router.put("/promociones/:id", async (req, res) => {
  const { titulo, descripcion, precio } = req.body;
  await db.query(
    "UPDATE promociones SET titulo = ?, descripcion = ? WHERE id = ?",
    [titulo, descripcion, req.params.id]
  );
  res.redirect("/admin/promociones?editado=1");
});

// Eliminar promoción
router.delete("/promociones/:id", async (req, res) => {
  await db.query("DELETE FROM promociones WHERE id = ?", [req.params.id]);
  res.redirect("/admin/promociones?eliminado=1");
});

module.exports = router;
