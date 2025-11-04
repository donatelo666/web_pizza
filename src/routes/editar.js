//modulo principal y router para activar la vista que renderiza editar

const express = require("express");
const router = express.Router();
const conexion = require("../config/database"); // tu conexión MySQL

// ✅ correcto renderiza editar y el select consulta de la base de datos
router.get("/", async (req, res) => {
  try {
    const [pizzas] = await conexion.query("SELECT * FROM pizzas");
    res.render("editar", { pizzas }); // renderiza la vista con la info del select
  } catch (error) {
    console.error("Error al obtener pizzas:", error);
    res.status(500).send("Error al cargar la página");
  }
});

module.exports = router;
