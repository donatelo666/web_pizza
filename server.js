//paquetes para iniciar el servidor  , conexion con base de datos , archivo verificar token 
// y rutas auth.js
const express = require("express");
const router = express.Router();
const cors = require("cors");
const database = require("./src/config/database.js");
const verificarToken = require('./src/middleware/verificartoken.js');
const authRoutes = require('./src/routes/auth.js');
const { body, param } = require('express-validator');



//configuracion inicial, uso de express , jason , cors y rutas de auth.js
const app = express();
app.use(express.json());
app.use(cors());
app.use('/', authRoutes);


// api post para insertar datos  usando un formulario con script en el html, verifica el token 
// envia dos console log de verificacion
router.post("/api/ordenes", verificarToken, [
    body('nombre').trim().escape().isLength({ min: 4, max: 20 }),
    body('telefono').isMobilePhone('es-CO'),
    body('tamano').isIn(['personal', 'mediana', 'familiar']),
    body('sabor').isIn(['champiñones', 'hawaiana', 'mexicana', 'salami'])
], (req, res) => {
    console.log("Solicitud recibida");
    console.log("Body:", req.body);

    //define el body y el id usuario
    const { nombre, telefono, tamano, sabor } = req.body;
    const usuarioId = req.usuarioId;

    if (!nombre || !telefono || !tamano || !sabor) {
        console.log("Datos incompletos:", { nombre, telefono, tamano, sabor });
        return res.status(400).json({ error: "Faltan datos en la orden" });//error de no enviar los datos 
    }

    //inserta en la base de datos la informacion y le da un id al usuario 
    database.query(
        "INSERT INTO ordenes (nombre, telefono, tamano, sabor, usuario_id ) VALUES (?, ?, ?, ?, ?)",
        [nombre, telefono, tamano, sabor, usuarioId],
        (err, resultado) => {
            if (err) {
                console.log("Error SQL:", err);
                return res.status(500).json({ error: "Error al guardar la orden" });//errores
            }

            res.json({ id: resultado.insertId, nombre, telefono });
        }
    );
});




// GET  consultar la orden por id y token presente,
router.get('/ordenes/:id', verificarToken, [
    param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo')
], (req, res) => {
    //define id del usuario e id de la orden 
    const usuarioId = req.usuarioId;
    const id = req.params.id;
    //hace la consulta en mysql 
    const query = 'SELECT * FROM ordenes WHERE id = ? AND usuario_id = ?';
    database.query(query, [id, usuarioId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(403).json({ error: 'No tienes permiso para ver esta orden' });//error 
        }

        res.json(results[0]); // ✅ solo se ejecuta si hay resultados en la orden ingresada por usuario

    });
});


// api put para editar la orden realizada usando el id , token 
router.put('/ordenes/:id', verificarToken, [
    body('nombre').trim().escape().isLength({ min: 4, max: 20 }),
    body('telefono').isMobilePhone('es-CO'),
    body('tamano').isIn(['personal', 'mediana', 'familiar']),
    body('sabor').isIn(['champiñones', 'hawaiana', 'mexicana', 'salami'])
], (req, res) => {
    // define id de la orden , body de la orden e id del usuario 
    const id = req.params.id;
    const { nombre, telefono, tamano, sabor } = req.body;
    const usuarioId = req.usuarioId;

    // 1. Verificar que la orden existe y pertenece al usuario
    database.query('SELECT * FROM ordenes WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ mensaje: 'Orden no encontrada' });

        const orden = results[0];
        if (orden.usuario_id !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para editar esta orden' });
        }// error del usuario si  quiere editar una orden ajena 

        // 2. Ejecutar el UPDATE en la base de datos con relacion al id 
        const query = 'UPDATE ordenes SET nombre = ?, telefono = ?, tamano = ?, sabor = ? WHERE id = ?';
        database.query(query, [nombre, telefono, tamano, sabor, id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: 'Orden actualizada con éxito' });// exito 
        });
    });
});


//api para borrar una orden de la base de datos usando el id y el token 
router.delete('/ordenes/:id', verificarToken, [
    param('id').isInt({ min: 1 }).withMessage('ID inválido')
], (req, res) => {
    //define id de orden e id de usuario
    const id = req.params.id;
    const usuarioId = req.usuarioId;

    // 1. Verificar que la orden existe y pertenece al usuario con un select 
    database.query('SELECT * FROM ordenes WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ mensaje: 'Orden no encontrada' });
        //errores

        const orden = results[0];
        if (orden.usuario_id !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta orden' });
            //sin permiso
        }

        // 2. Ejecutar el DELETE con sql 
        database.query('DELETE FROM ordenes WHERE id = ?', [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: 'Orden eliminada con éxito' });// exito 
        });
    });
});




app.use(router); // ✅ conecta todas las rutas definidas en el router


//mensaje que se envia exitosamente por consola al tener exito con la iniciacion del 
// servidor en puerto 3000 
app.listen(3000, () => {
    console.log("servidor corriendo en el puerto http://localhost:3000")
})



