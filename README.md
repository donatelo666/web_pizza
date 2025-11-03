# 🍕 TMNT PIZZA

Aplicación web completa para administrar y ordenar pizzas con carrito, desarrollada con Node.js, Express, EJS y MySQL. Incluye autenticación, panel de administración, subida de imágenes, control de roles y una experiencia de usuario moderna y responsiva.

---

## 🚀 Características principales

- 🔐 Autenticación con JWT y cookies seguras
- 🧑‍🍳 Panel de administración con edición de menú, usuarios, órdenes y promociones
- 🖼️ Subida de imágenes con Multer y eliminación automática de archivos antiguos
- 🎠 Carruseles dinámicos de pizzas, imágenes y menú con Bootstrap 5
- 🧾 Notificaciones visuales animadas con CSS
- 🧩 Modularización de rutas y vistas
- 🧠 Control de acceso por roles (admin / cliente)
- 📱 Diseño responsive y experiencia de usuario pulida

---

## 🛠️ Tecnologías utilizadas

- **Backend:** Node.js, Express.js, method-override, bcrypt
- **Frontend:** EJS, Bootstrap 5, CSS personalizado, HTML
- **Base de datos:** MySQL con promesas
- **Autenticación:** JSON Web Tokens (JWT), cookie-parser
- **Subida de archivos:** Multer
- **Gestión de imágenes:** fs, path

---

## 📸 Capturas de pantalla

- ![Panel admin](./public/demo/panel%20admin.jpg)
- ![Inicio](./public/demo/incio.jpg)
- ![Menú Bootstrap](./public/demo/menu%20bootstrap.jpg)
- ![Registro/Login](./public/demo/registro-login.jpg)
- ![Carrito](./public/demo/carrito.jpg)

---

## ⚙️ Instalación y ejecución

1. Clona el repositorio:

```bash
git clone https://github.com/donatelo666/web_pizza
cd web_pizza
npm install

2 Configura tu archivo .env:

 Base de Datos

-- Tabla usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'cliente') DEFAULT 'cliente'
);

-- Tabla pizzas
CREATE TABLE pizzas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ingredientes TEXT NOT NULL,
  ruta_imagen VARCHAR(255)
);

-- Tabla órdenes
CREATE TABLE ordenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  telefono VARCHAR(20),
  tamano VARCHAR(50),
  sabor VARCHAR(100),
  id_usuario INT
);

-- Tabla promociones
CREATE TABLE promociones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100),
  descripcion TEXT
);

Endpoints    principales

Método	        Ruta	        Descripción

POST	  /api/register	      Registro de usuario
POST	  /api/login	        Inicio de sesión
GET	    /api/orders	        Consultar carrito (protegido)
POST	  /api/orders	        Crear carrito (protegido)
PUT	    /api/orders/:id	    Actualizar pedido(protegido)
DELETE	/api/orders/:id	    Eliminar pedido(protegido)

📦 Dependencias principales

- express
- mysql2
- dotenv
- cookie-parser
- jsonwebtoken
- ejs
- multer
- bcryptjs


🔐 Seguridad

Contraseñas cifradas con bcrypt

Tokens JWT para autenticación

Middleware para protección de rutas y control de roles

👨‍💻 Autor

David Sebastian Sandoval Desarrollador web apasionado por crear aplicaciones dinámicas, seguras y visualmente atractivas. 📫 [chopolonsio@hotmail.com]




```
