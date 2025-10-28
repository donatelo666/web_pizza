//paquetes necesarios para las rutas
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database.js"); // tu conexión MySQL
const multer = require("multer");
const path = require("path");
const app = express(); // ... importación de Multer y configuración de 'upload' ...
const fs = require("fs"); // Módulo para operaciones de archivos

// 1. Configuración del lugar de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Especifica la carpeta donde se guardarán los archivos
    cb(null, "./front/public");
  },
  filename: (req, file, cb) => {
    // Genera un nombre de archivo único para evitar colisiones
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Usa el nombre original + el sufijo único + la extensión original
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// 2. Middleware Multer configurado
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Opcional: Límite de 5MB por archivo
});

// 2. Ruta de Edición de la Pizza
router.post(
  "/api/pizzas/actualizar",
  upload.single("imagen"),
  async (req, res) => {
    const { pizzaId, nombre, ingredientes } = req.body;
    let nuevaRutaImagen = null;

    if (!pizzaId) {
      return res.status(400).send("Se requiere el ID de la pizza para editar.");
    }

    try {
      // A) Obtener la información actual de la pizza (especialmente la ruta de la imagen)
      const [pizzas] = await db.query(
        "SELECT ruta_imagen FROM pizzas WHERE id = ?",
        [pizzaId]
      );
      const rutaImagenActual = pizzas[0] ? pizzas[0].ruta_imagen : null;

      // B) Lógica Condicional: ¿Se subió una NUEVA imagen?
      if (req.file) {
        // Se subió una nueva imagen.
        nuevaRutaImagen = path.join("/imagenes_subidas", req.file.filename);

        // i. ELIMINAR la imagen antigua
        if (rutaImagenActual) {
          // Genera la ruta completa del archivo en el servidor
          const rutaFisicaAntigua = path.join(
            __dirname,
            "public",
            rutaImagenActual
          );
          fs.unlink(rutaFisicaAntigua, (err) => {
            if (err) console.error("Error al eliminar imagen antigua:", err);
            console.log(`Imagen antigua eliminada: ${rutaFisicaAntigua}`);
          });
        }
      } else {
        // NO se subió una nueva imagen, se mantiene la actual.
        nuevaRutaImagen = rutaImagenActual;
      }

      // C) Ejecutar el UPDATE en MySQL
      const query = `
            UPDATE pizzas 
            SET nombre = ?, ingredientes = ?, ruta_imagen = ? 
            WHERE id = ?
        `;

      await db.execute(query, [nombre, ingredientes, nuevaRutaImagen, pizzaId]);

      res.status(200).send({ message: "Pizza actualizada con éxito." });
    } catch (error) {
      console.error("Error al actualizar la pizza:", error);
      res
        .status(500)
        .send({ message: "Error en el servidor al actualizar la pizza." });
    }
  }
);

//activa las rutas para ser usadas
module.exports = router;
app.listen(3000, () => console.log("Servidor corriendo en el puerto 3000"));
