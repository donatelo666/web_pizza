//modulo principal y router para activar la vista que renderiza contacto
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("contacto");
});

module.exports = router;
