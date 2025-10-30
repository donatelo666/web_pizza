const express = require("express");
const router = express.Router();
const db = require("../config/database.js"); // tu conexión MySQL

router.get("/", async (req, res) => {
  const [promociones] = await db.query(
    "SELECT * FROM promociones WHERE activo = true"
  );
  res.render("promos", { promociones });
});

module.exports = router;
