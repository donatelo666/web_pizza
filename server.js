const express = require("express");
const cors = require("cors");
const path = require("path");
const { body, param, validationResult } = require("express-validator");

const database = require("./src/config/database.js");
const verificarToken = require("./src/middleware/verificartoken.js");
const authRoutes = require("./src/routes/auth.js");
const menuRoutes = require("./src/routes/menu.js");
const inicioRoutes = require("./src/routes/incio.js");
const contactoRoutes = require("./src/routes/contacto.js");
const editarRoutes = require("./src/routes/editar.js");
const promosRoutes = require("./src/routes/promos.js");
const adminRoutes = require("./src/routes/admin.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/menu", menuRoutes);
app.use("/inicio", inicioRoutes);
app.use("/contacto", contactoRoutes);
app.use("/editar", editarRoutes);
app.use("/promos", promosRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);

// Rutas protegidas con token y base de datos con promesas
const router = express.Router();

router.post(
  "/api/ordenes",
  verificarToken,
  [
    body("nombre").trim().escape().isLength({ min: 4, max: 20 }),
    body("telefono").isMobilePhone("es-CO"),
    body("tamano").isIn(["personal", "mediana", "familiar"]),
    body("sabor").isIn(["champiñones", "hawaiana", "mexicana", "salami"]),
  ],
  async (req, res) => {
    console.log("Solicitud recibida");
    console.log("Body:", req.body);

    const { nombre, telefono, tamano, sabor } = req.body;
    const usuarioId = req.usuarioId;

    if (!nombre || !telefono || !tamano || !sabor) {
      return res.status(400).json({ error: "Faltan datos en la orden" });
    }

    try {
      const [resultado] = await database.query(
        "INSERT INTO ordenes (nombre, telefono, tamano, sabor, usuario_id) VALUES (?, ?, ?, ?, ?)",
        [nombre, telefono, tamano, sabor, usuarioId]
      );
      res.json({ id: resultado.insertId, nombre, telefono });
    } catch (err) {
      console.error("Error SQL:", err);
      res.status(500).json({ error: "Error al guardar la orden" });
    }
  }
);

router.get(
  "/ordenes/:id",
  verificarToken,
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID debe ser un número entero positivo"),
  ],
  async (req, res) => {
    const usuarioId = req.usuarioId;
    const id = req.params.id;

    try {
      const [results] = await database.query(
        "SELECT * FROM ordenes WHERE id = ? AND usuario_id = ?",
        [id, usuarioId]
      );

      if (results.length === 0) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para ver esta orden" });
      }

      res.json(results[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/ordenes/:id",
  verificarToken,
  [
    body("nombre").trim().escape().isLength({ min: 4, max: 20 }),
    body("telefono").isMobilePhone("es-CO"),
    body("tamano").isIn(["personal", "mediana", "familiar"]),
    body("sabor").isIn(["champiñones", "hawaiana", "mexicana", "salami"]),
  ],
  async (req, res) => {
    const id = req.params.id;
    const { nombre, telefono, tamano, sabor } = req.body;
    const usuarioId = req.usuarioId;

    try {
      const [results] = await database.query(
        "SELECT * FROM ordenes WHERE id = ?",
        [id]
      );
      if (results.length === 0) {
        return res.status(404).json({ mensaje: "Orden no encontrada" });
      }

      const orden = results[0];
      if (orden.usuario_id !== usuarioId) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para editar esta orden" });
      }

      await database.query(
        "UPDATE ordenes SET nombre = ?, telefono = ?, tamano = ?, sabor = ? WHERE id = ?",
        [nombre, telefono, tamano, sabor, id]
      );

      res.json({ mensaje: "Orden actualizada con éxito" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/ordenes/:id",
  verificarToken,
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  async (req, res) => {
    const id = req.params.id;
    const usuarioId = req.usuarioId;

    try {
      const [results] = await database.query(
        "SELECT * FROM ordenes WHERE id = ?",
        [id]
      );
      if (results.length === 0) {
        return res.status(404).json({ mensaje: "Orden no encontrada" });
      }

      const orden = results[0];
      if (orden.usuario_id !== usuarioId) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para eliminar esta orden" });
      }

      await database.query("DELETE FROM ordenes WHERE id = ?", [id]);
      res.json({ mensaje: "Orden eliminada con éxito" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.use(router);

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto http://localhost:3000");
});
