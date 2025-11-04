const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

describe("Ruta protegida POST /api/ordenes", () => {
  let token;

  beforeAll(() => {
    // Genera un token válido para el usuario con id 1
    token = jwt.sign({ id: 16, rol: "cliente" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  it("debería crear una orden con datos válidos", async () => {
    const res = await request(app)
      .post("/api/ordenes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "David",
        telefono: "3001234567",
        tamano: "mediana",
        sabor: "mexicana",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.nombre).toBe("David");
    expect(res.body.telefono).toBe("3001234567");
  });

  it("debería fallar si falta el nombre", async () => {
    const res = await request(app)
      .post("/api/ordenes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        telefono: "3001234567",
        tamano: "mediana",
        sabor: "mexicana",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/El nombre es requerido/i);
  });

  it("debería fallar si el sabor no es válido", async () => {
    const res = await request(app)
      .post("/api/ordenes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "David",
        telefono: "3001234567",
        tamano: "mediana",
        sabor: "pepperoni", // no permitido
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/El sabor es requerido/i);
  });

  it("debería fallar si no se envía token", async () => {
    const res = await request(app).post("/api/ordenes").send({
      nombre: "David",
      telefono: "3001234567",
      tamano: "mediana",
      sabor: "mexicana",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Acceso denegado. Token no proporcionado./i);
  });
});
