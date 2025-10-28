const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("contacto", { modo: "login" }); // o "registro"
});

module.exports = router;
