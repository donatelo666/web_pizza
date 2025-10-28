const express = require("express");
const router = express.Router();
const db = require("../config/database.js"); // tu conexión MySQL

// Define la ruta. DEBE ser exactamente '/menu' si es lo que pide el navegador.
router.get("/", async (req, res) => {
  try {
    // ... Consulta a MySQL ...
    const [pizzas] = await db.query(
      "SELECT nombre, ingredientes, ruta_imagen FROM pizzas"
    );

    // Renderiza la plantilla EJS
    res.render("menu", { pizzas: pizzas });
  } catch (error) {
    console.error("Error en la ruta /menu:", error);
    res.status(500).send("Error al cargar el menú.");
  }
});

module.exports = router; // ¡ Exportar el router!
