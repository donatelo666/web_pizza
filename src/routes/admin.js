//modulos principales, router, database, midlleware, multer
const express = require("express");
const router = express.Router();
const db = require("../config/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configurar almacenamiento de multer en carpeta uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName); //crea nombres unicos para cada subida
  },
});

const upload = multer({ storage }); //ubicacion de las uploads

//ruta para ver la pestaña panel con verificacion de token
router.get("/panel", async (req, res) => {
  try {
    res.render("admin/panel"); // Vista EJS del panel
  } catch (err) {
    console.error("Error en /admin/panel:", err);
    res.status(500).send("Error interno al verificar acceso");
  }
});

//ruta para ver edicion del menu con edicion de cada pizza
router.get("/edit_menu", async (req, res) => {
  const [pizzas] = await db.query("SELECT * FROM pizzas");
  res.render("admin/edit_menu", { pizzas });
});

// 🧀 Actualizar menú de pizzas
router.post(
  "/edit_menu/actualizar",
  upload.single("imagen"),
  async (req, res) => {
    const { pizzaId, nombre, ingredientes, imagenActual } = req.body;

    try {
      // Si se subió una nueva imagen...
      let nuevaImagen = imagenActual;

      if (req.file) {
        // 🟡 Eliminar la imagen anterior si existe
        const rutaAntigua = path.join(
          __dirname,
          "../public",
          imagenActual.replace("/", "\\") // reemplaza
        );

        if (fs.existsSync(rutaAntigua)) {
          fs.unlinkSync(rutaAntigua);
          console.log("🗑️ Imagen anterior eliminada:", rutaAntigua);
        }

        // 🆕 Guardar la nueva imagen
        nuevaImagen = `/uploads/${req.file.filename}`;
      }

      // 🧩 Actualizar registro en la base de datos
      await db.query(
        "UPDATE pizzas SET nombre = ?, ingredientes = ?, ruta_imagen = ? WHERE id = ?",
        [nombre, ingredientes, nuevaImagen, pizzaId]
      );

      console.log("✅ Pizza actualizada correctamente:", pizzaId);
      res.status(200).json({ mensaje: "Pizza actualizada correctamente" });
    } catch (err) {
      console.error("❌ Error al actualizar pizza:", err);
      res.status(500).json({ error: "Error al actualizar la pizza" });
    }
  }
);

// Ruta para crear pizza
router.post(
  "/edit_menu/crear",
  upload.single("ruta_imagen"),
  async (req, res) => {
    const { nombre, ingredientes } = req.body;
    const ruta_imagen = req.file ? `/uploads/${req.file.filename}` : null; //definicion de ruta

    if (!nombre || !ingredientes) {
      return res.status(400).json({ error: "Faltan datos requeridos" }); //ausencia de datos
    }

    try {
      await db.query(
        "INSERT INTO pizzas (nombre, ingredientes, ruta_imagen) VALUES (?, ?, ?)",
        [nombre, ingredientes, ruta_imagen]
      );
      res.status(200).json({ mensaje: "Pizza creada correctamente ✅" }); //respuesta
    } catch (err) {
      console.error("Error al crear pizza:", err);
      res.status(500).json({ error: "Error al crear la pizza" });
    }
  }
);

//ruta para ver usuarios, llenado de formulario para editar usuario en frontend
router.get("/usuarios", async (req, res) => {
  try {
    const [usuarios] = await db.query("SELECT * FROM usuarios");

    let usuarioParaEditar = null;
    if (req.query.editar) {
      const [resultado] = await db.query(
        "SELECT * FROM usuarios WHERE id = ?",
        [req.query.editar]
      );
      usuarioParaEditar = resultado[0] || null;
    }

    // 🔥 pasa variables para renderizar la informacion
    res.render("admin/usuarios", {
      usuarios,
      usuarioParaEditar,
      mensaje: "",
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).send("Error al cargar usuarios");
  }
});

// 🟩 Ruta para editar usuario con un query ,
router.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, rol } = req.body;

  try {
    await db.query("UPDATE usuarios SET nombre = ?, rol = ? WHERE id = ?", [
      nombre,
      rol,
      id,
    ]);

    // ✅ Consultar la lista actualizada de usuarios
    const [usuarios] = await db.query("SELECT id, nombre, rol FROM usuarios");

    // Enviar mensaje de éxito a la vista
    res.render("admin/usuarios", {
      usuarios,
      mensaje: "Usuario actualizado correctamente",
      usuarioParaEditar: null, //  para ocultar el formulario de edición
    });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).send("Error al editar el usuario");
  }
});

//ruta para eliminar usuarios con override
router.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM usuarios WHERE id = ?", [id]); //elimina por id
  res.redirect("/admin/usuarios?eliminado=1"); // ✅ redirige con flag
});

//ruta pa ver ordenes
router.get("/ordenes", async (req, res) => {
  try {
    const [ordenes] = await db.query("SELECT * FROM ordenes"); //query

    let ordenParaEditar = null;
    if (req.query.editar) {
      const [resultado] = await db.query("SELECT * FROM ordenes WHERE id = ?", [
        req.query.editar,
      ]);
      ordenParaEditar = resultado[0] || null;
    } //llena con datos el formulario para editar (query)

    // 🔥 renderiza la info de  varias variables
    res.render("admin/ordenes", {
      ordenes,
      ordenParaEditar,
      mensaje: "",
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).send("Error al cargar usuarios");
  }
});

// 🟩 Ruta para editar orden con querys y alert
router.put("/ordenes/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, tamano, sabor } = req.body;

  try {
    //query de edicion
    await db.query(
      "UPDATE ordenes SET nombre = ?, telefono = ?, tamano = ?, sabor = ? WHERE id = ?",
      [nombre, telefono, tamano, sabor, id]
    );

    // Traer todas las órdenes actualizadas
    const [ordenes] = await db.query("SELECT * FROM ordenes");

    // Enviar mensaje de éxito a la vista
    res.render("admin/ordenes", {
      ordenes,
      mensaje: "Orden actualizada correctamente",
      ordenParaEditar: null, //necesario para editar
    });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).send("Error al editar el usuario");
  }
});

//ruta para eliminar orden con override y alert
router.delete("/ordenes/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM ordenes WHERE id = ?", [id]);
  res.redirect("/admin/ordenes?eliminado=1"); // ✅ redirige con flag
});

// 🟢 Mostrar todas las promociones mas vista (querys)
router.get("/promociones", async (req, res) => {
  try {
    const [promociones] = await db.query("SELECT * FROM promociones");
    res.render("admin/promociones", {
      promociones,
      mensaje: "",
      promoParaEditar: null,
    });
  } catch (err) {
    console.error("Error al cargar promociones:", err);
    res.status(500).send("Error al cargar las promociones");
  }
});

// 🟢 Crear nueva promoción con query , mensaje
router.post("/promociones/crear", async (req, res) => {
  const { titulo, descripcion } = req.body;

  try {
    await db.query(
      "INSERT INTO promociones (titulo, descripcion) VALUES (?, ?)",
      [titulo, descripcion]
    ); //inserta en database

    const [promociones] = await db.query("SELECT * FROM promociones"); //actualiza

    res.render("admin/promociones", {
      promociones,
      mensaje: "✅ Promoción creada correctamente", //mensaje
      promoParaEditar: null,
    });
  } catch (err) {
    console.error("Error al crear promoción:", err);
    res.status(500).send("Error al crear la promoción");
  }
});

// 🟢 Editar promoción (mostrar formulario con datos)
router.get("/promociones/editar/:id", async (req, res) => {
  try {
    const [promos] = await db.query("SELECT * FROM promociones WHERE id = ?", [
      req.params.id,
    ]); //busca la promo por id

    const [promociones] = await db.query("SELECT * FROM promociones"); //actualiza

    res.render("admin/promociones", {
      promociones,
      promoParaEditar: promos[0], // se usa en el formulario de edicion
      mensaje: "",
    });
  } catch (err) {
    console.error("Error al cargar promoción:", err);
    res.status(500).send("Error al cargar la promoción");
  }
});

// 🟢 Actualizar promoción con query mas mensaje
router.put("/promociones/:id", async (req, res) => {
  const { titulo, descripcion } = req.body;

  try {
    await db.query(
      "UPDATE promociones SET titulo = ?, descripcion = ? WHERE id = ?",
      [titulo, descripcion, req.params.id]
    ); //actualiza

    const [promociones] = await db.query("SELECT * FROM promociones");

    res.render("admin/promociones", {
      promociones,
      mensaje: "✏️ Promoción editada correctamente", //mensaje
      promoParaEditar: null,
    });
  } catch (err) {
    console.error("Error al editar promoción:", err);
    res.status(500).send("Error al editar la promoción");
  }
});

// 🟢 Eliminar promoción con query mas mensaje
router.delete("/promociones/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM promociones WHERE id = ?", [req.params.id]); //busca el id y elimina

    const [promociones] = await db.query("SELECT * FROM promociones"); //actualiza

    res.render("admin/promociones", {
      promociones,
      mensaje: "🗑️ Promoción eliminada correctamente", //mensaje
      promoParaEditar: null,
    });
  } catch (err) {
    console.error("Error al eliminar promoción:", err);
    res.status(500).send("Error al eliminar la promoción");
  }
});

module.exports = router;
