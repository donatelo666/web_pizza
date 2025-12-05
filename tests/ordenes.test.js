const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

describe("Ruta protegida POST /api/ordenes", () => {
  let token;

  beforeAll(() => {
    // Genera un token válido para el usuario con id 16
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

  it("debería fallar si el tamaño no es válido", async () => {
    const res = await request(app)
      .post("/api/ordenes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "David",
        telefono: "3001234567",
        tamano: "Errado", // no permitido
        sabor: "mexicana",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/El Tamaño es requerido/i);
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

describe("Ruta protegida PUT /api/ordenes/:id", () => {
  let token;

  beforeAll(() => {
    // Genera un token válido para el usuario con id 16
    token = jwt.sign({ id: 16, rol: "cliente" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  it("debería actualizar una orden con datos válidos", async () => {
    const res = await request(app)
      .put("/api/ordenes/68")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "David-actualizado",
        telefono: "3001234567",
        tamano: "personal",
        sabor: "champiñones",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch("Orden actualizada con exito");
  });
});

describe("Ruta protegida GET /api/ordenes/:id", () => {
  let token;

  beforeAll(() => {
    // Genera un token válido para el usuario con id 16
    token = jwt.sign({ id: 16, rol: "cliente" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  it("debería mostrar una orden con datos válidos", async () => {
    const res = await request(app)
      .get("/api/ordenes/68")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", 68);
  });

  it("debería fallar por orden que no pertenece a usuario", async () => {
    const res = await request(app)
      .get("/api/ordenes/99")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/No tienes permiso para ver esta orden/i);
  });
});

describe("Ruta protegida DELETE /api/ordenes/:id", () => {
  let token;

  beforeAll(() => {
    // Genera un token válido para el usuario con id 16
    token = jwt.sign({ id: 16, rol: "cliente" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  });

  it("debería eliminar una orden con datos válidos", async () => {
    const res = await request(app)
      .delete("/api/ordenes/68")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/Orden eliminada con exito/i);
  });

  it("debería fallar eliminacion por orden inexistente", async () => {
    const res = await request(app)
      .delete("/api/ordenes/98")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
