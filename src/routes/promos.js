//modulo principal , router
const express = require("express");
const router = express.Router();
const db = require("../config/database.js"); // conexión MySQL

//renderiza promos mas tarjetas activas
router.get("/", async (req, res) => {
  const [promociones] = await db.query(
    "SELECT * FROM promociones WHERE activo = true"
  );
  res.render("promos", { promociones });
});

module.exports = router;
