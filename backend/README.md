TMNT PIZZA WEB

Proyecto académico de desarrollo web que implementa un sistema completo de autenticación y gestión de pedidos de pizza. Utiliza Node.js, Express, router, cors, bcrypt, jsonwebtoken y MySQL para el backend, y HTML/CSS/JavaScript/Bootstrap para el frontend.

Características
•	Registro de usuarios con validación
•	Inicio de sesión con autenticación JWT
•	Protección de rutas sensibles (CRUD solo para usuarios autenticados)
•	Gestión de pedidos de pizza (crear, leer, actualizar, eliminar)
•	Bootstrap para diseño responsivo

Estructura

Tiene una carpeta para el frontend y otra para el backend.

Instalacion

Clona el repositorio, instala dependencias, configura archivo .env con datos propios, crea la base de datos así :

Nombre : pizzas 

1. 	tabla : usuarios
	- id (INT, PRIMARY KEY , NOT NULL, AUTO INCREMENT)
	-nombre(VARCHAR 50)
	-password(VARCHAR 50)
	-rol(VARCHAR 50)

2. 	Tabla: ordenes 
    -id (INT, PRIMARY KEY,AUTO INCREMENT)
    -nombre (VARCHAR 50)
    -telefono (VARCHAR 50)
    -tamano (VARCHAR 50)
    -sabor (VARCHAR 50)
    -usuario_id  (INT)
3.	usa sql para relacionar  las tablas ALTER TABLE ordenes  ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id).

Endpoints principales

Método	Ruta	                Descripción
POST	/api/register	     Registro de usuario
POST	/api/login	         Inicio de sesión
GET	    /api/orders	         Obtener pedidos (protegido)
POST	/api/orders	         Crear pedido (protegido)
PUT	    /api/orders/:id	     Actualizar pedido (protegido)
DELETE	/api/orders/:id	     Eliminar pedido (protegido)

Seguridad
•	Contraseñas cifradas con bcrypt
•	Tokens JWT para autenticación
•	Middleware de protección de rutas

Desarrollado por Sebastian Sandoval en el sena 2025
		




