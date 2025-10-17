//paquetes necesarios para las rutas 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database.js'); // tu conexión MySQL


// ruta registro define el body , encripta la contraseña con bcrypt, inserta en mysql
//pone rol y maneja errores 
router.post('/register', async (req, res) => {
    const { nombre, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el saltRounds
        db.query('INSERT INTO usuarios SET ?', {
            nombre,
            password: hashedPassword,
            rol: 'cliente'
        }, (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al registrar' });
            res.status(201).json({ message: 'Usuario registrado, puede iniciar sesion con esos datos' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al encriptar la contraseña' });
    }
});



//ruta login , define el body 
router.post('/login', (req, res) => {
    const { nombre, password } = req.body;
    //hace consulta en la base de datos por nombre de usuario 
    db.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

        const usuario = results[0];
        //compara la contraseña encriptada
        const match = await bcrypt.compare(password, usuario.password);
        if (!match) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }//error

        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, 'clave_secreta', { expiresIn: '1h' });
        res.json({ token });//exito , otroga el token por 1 h al usuario 
    });
});





//activa las rutas para ser usadas
module.exports = router;
