//Importaciones de módulos principales
const express = require("express");
const cors = require("cors");
const path = require("path");
const { body, param, validationResult } = require("express-validator");

// Importación de archivos locales
const database = require("./src/config/database.js");
const verificarToken = require("./src/middleware/verificartoken.js");
const authRoutes = require("./src/routes/auth.js");
const menuRoutes = require("./src/routes/menu.js");
const inicioRoutes = require("./src/routes/incio.js");
const contactoRoutes = require("./src/routes/contacto.js");
const editarRoutes = require("./src/routes/editar.js");
const promosRoutes = require("./src/routes/promos.js");
const adminRoutes = require("./src/routes/admin.js");

//Middlewares adicionales
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

//aplicación de Express
const app = express();

// Middlewares de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Middlewares de terceros
app.use(cors());
app.use(cookieParser());
app.use(methodOverride("_method"));

// Configuración de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = path.join(__dirname, "views");

//activar rutas de vistas y mas (admin, auth)
app.use("/menu", menuRoutes);
app.use("/inicio", inicioRoutes);
app.use("/contacto", contactoRoutes);
app.use("/editar", editarRoutes);
app.use("/promos", promosRoutes);
app.use("/admin", verificarToken, adminRoutes); //prueba de verificar
app.use("/auth", authRoutes);

// Rutas protegidas con token y base de datos con promesas
const router = express.Router();

//ruta post para ordenar, con token, sanitizacionde datos,
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
    const { nombre, telefono, tamano, sabor } = req.body; //cuerpo
    const usuarioId = req.usuarioId; //id

    if (!nombre || !telefono || !tamano || !sabor) {
      return res.status(400).json({ error: "Faltan datos en la orden" });
    } //verificacion

    try {
      //insercion de base de datos
      const [resultado] = await database.query(
        "INSERT INTO ordenes (nombre, telefono, tamano, sabor, usuario_id) VALUES (?, ?, ?, ?, ?)",
        [nombre, telefono, tamano, sabor, usuarioId]
      );
      res.json({ id: resultado.insertId, nombre, telefono }); //respuesta en json
    } catch (err) {
      console.error("Error SQL:", err);
      res.status(500).json({ error: "Error al guardar la orden" });
    }
  }
);

//ruta de consulta por id , con token ,sanitizacion,
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
      //select de la base de datos
      const [results] = await database.query(
        "SELECT * FROM ordenes WHERE id = ? AND usuario_id = ?",
        [id, usuarioId]
      );

      if (results.length === 0) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para ver esta orden" }); //verificacion
      }

      res.json(results[0]); //respuesta
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//ruta editar con token , sanitizacion
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
        return res.status(404).json({ mensaje: "Orden no encontrada" }); //verificacion por valor
      }

      const orden = results[0];
      if (orden.usuario_id !== usuarioId) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para editar esta orden" }); //verificacion  por id
      }

      await database.query(
        //actualiza
        "UPDATE ordenes SET nombre = ?, telefono = ?, tamano = ?, sabor = ? WHERE id = ?",
        [nombre, telefono, tamano, sabor, id]
      );

      res.json({ mensaje: "Orden actualizada con éxito" }); //respuesta
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//ruta eliminar con token , sanitizacion
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
        return res.status(404).json({ mensaje: "Orden no encontrada" }); //verificacion de valor
      }

      const orden = results[0];
      if (orden.usuario_id !== usuarioId) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para eliminar esta orden" }); //verificacion de id
      }

      await database.query("DELETE FROM ordenes WHERE id = ?", [id]); //borra por id
      res.json({ mensaje: "Orden eliminada con éxito" }); //respuesta
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.use(router); //activa las rutas con router

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto http://localhost:3000");
}); //confirma que express esta funcionando en el puerto 3000 con console.log
