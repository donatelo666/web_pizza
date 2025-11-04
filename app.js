const express = require("express");
const cors = require("cors");
const path = require("path");
const { body, param, validationResult } = require("express-validator");
const app = express();
require("dotenv").config(); //para usar la info de .env

// Importación de archivos locales
const ordenesRoutes = require("./src/routes/ordenes.js");
const database = require("./src/config/database.js");
const verificarToken = require("./src/middleware/verificartoken.js");
const authRoutes = require("./src/routes/auth.js");
const menuRoutes = require("./src/routes/menu.js");
const inicioRoutes = require("./src/routes/incio.js");
const contactoRoutes = require("./src/routes/contacto.js");
const editarRoutes = require("./src/routes/editar.js");
const promosRoutes = require("./src/routes/promos.js");
const adminRoutes = require("./src/routes/admin.js");

//middlewares
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

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
app.use("/api", ordenesRoutes); // ✅ activa /api/ordenes

// Exporta la app para usarla en los tests
module.exports = app;
