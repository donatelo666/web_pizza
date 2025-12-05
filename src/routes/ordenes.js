const express = require("express");
const router = express.Router();
const database = require("../config/database");
const verificarToken = require("../middleware/verificartoken");
const { body, param, validationResult } = require("express-validator");

// Crear orden
router.post(
  "/ordenes",
  verificarToken,
  [
    body("nombre")
      .trim()
      .escape()
      .isLength({ min: 4, max: 20 })
      .withMessage("El nombre es requerido"),
    body("telefono")
      .isMobilePhone("es-CO")
      .withMessage("El teléfono es requerido"),
    body("tamano")
      .isIn(["personal", "mediana", "familiar"])
      .withMessage("El tamaño es requerido"),
    body("sabor").notEmpty().withMessage("Debes seleccionar un sabor."),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ error: errores.array()[0].msg });
    }

    const { nombre, telefono, tamano, sabor } = req.body;
    const usuarioId = req.usuarioId;

    try {
      const [resultado] = await database.query(
        "INSERT INTO ordenes (nombre, telefono, tamano, sabor, usuario_id) VALUES (?, ?, ?, ?, ?)",
        [nombre, telefono, tamano, sabor, usuarioId]
      );
      res.status(201).json({ id: resultado.insertId, nombre, telefono });
    } catch (err) {
      console.error("Error SQL:", err);
      res.status(500).json({ error: "Error al guardar la orden" });
    }
  }
);

// Consultar orden por ID
router.get(
  "/ordenes/:id",
  verificarToken,
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID debe ser un número entero positivo"),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ error: errores.array()[0].msg });
    }

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

      res.status(200).json(results[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Editar orden
router.put(
  "/ordenes/:id",
  verificarToken,
  [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    body("nombre")
      .trim()
      .escape()
      .isLength({ min: 4, max: 20 })
      .withMessage("Nombre inválido"),
    body("telefono").isMobilePhone("es-CO").withMessage("Teléfono inválido"),
    body("tamano")
      .isIn(["personal", "mediana", "familiar"])
      .withMessage("Tamaño inválido"),
    body("sabor").notEmpty().withMessage("Debes seleccionar un sabor."),
  ],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ error: errores.array()[0].msg });
    }

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

      res.status(200).json({ mensaje: "Orden actualizada con exito" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Eliminar orden
router.delete(
  "/ordenes/:id",
  verificarToken,
  [param("id").isInt({ min: 1 }).withMessage("ID inválido")],
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ error: errores.array()[0].msg });
    }

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
      res.status(200).json({ mensaje: "Orden eliminada con exito" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
