const request = require("supertest");
const app = require("../app"); // Asegúrate de exportar tu instancia de Express
const pool = require("../src/config/database"); //para poner la base de datos

describe("Registro de usuario", () => {
  it("debería registrar un usuario con nombre y password válidos", async () => {
    const res = await request(app).post("/auth/register").send({
      nombre: "david2",
      password: "secure123",
    });

    expect(res.statusCode).toBe(200); // o 200 si usas ese código
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/Registro exitoso/i);
  });

  it("debería fallar si falta el nombre", async () => {
    const res = await request(app).post("/auth/register").send({
      password: "secure123",
    });

    expect(res.statusCode).toBe(400); // o el código que uses para validación
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/El nombre es requerido/i);
  });

  it("debería fallar si falta el password", async () => {
    const res = await request(app).post("/auth/register").send({
      nombre: "David",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/El password es requerido/i);
  });
});

describe("Login de usuario", () => {
  it("debería loguear con credenciales válidas", async () => {
    const res = await request(app).post("/auth/login").send({
      nombre: "maria23",
      password: "maria23",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token"); // si usas JWT
  });

  it("debería fallar si falta el nombre", async () => {
    const res = await request(app).post("/auth/login").send({
      password: "1234",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/El nombre es requerido/i);
  });

  it("debería fallar si las credenciales son incorrectas", async () => {
    const res = await request(app).post("/auth/login").send({
      nombre: "maria23",
      password: "incorrecta",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Usuario o contraseña incorrectos/i);
  });
});

afterAll(async () => {
  await pool.end(); // cierra la conexión del pool de la base de datos
});
