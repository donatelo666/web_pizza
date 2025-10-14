require('dotenv').config();
//paquete de mysql 
const mysql = require("mysql2");

//crea la conexion con mis datos protegisdos por el .env 
const conexion = mysql.createConnection({
    host: process.env.host,
    database: process.env.database,
    user: process.env.user,
    password: process.env.password

})
conexion.connect((err) => {
    if (err) {
        console.error("error en la conexion con mysql", err);//error
        return;
    }
    console.log("conexion exitosa mysql")//exito
});
//activa la conexion
module.exports = conexion;
