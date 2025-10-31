//script de registro con sanitizacion de datos,notificacion
const sanitize = (str) => str.replace(/[<>"'`]/g, "");
function mostrarNotificacion() {
  const mensaje = `✅ Registro de usuario completado con éxito<br> ahora puedes hacer login y ordenar`;
  const notificacion = document.getElementById("notificacion");
  notificacion.innerHTML = mensaje;
  notificacion.classList.remove("oculto"); //quita el oculto
  notificacion.classList.add("visible"); // pone

  // Ocultar después de 10 segundos

  setTimeout(() => {
    notificacion.classList.remove("visible");
    notificacion.classList.add("oculto");
  }, 10000);
}

//carga el DOM , esucha el submit , previene default , sanitiza
document.addEventListener("DOMContentLoaded", () => {
  const registroForm = document.getElementById("registroForm");
  if (!registroForm) {
    console.error("Formulario de registro no encontrado");
    return;
  }

  registroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
      nombre: sanitize(formData.get("nombre")),
      password: sanitize(formData.get("password")),
    };

    //usa el backend
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await res.json();
      } catch (err) {
        console.error("Respuesta inesperada:");
        alert("Error inesperado al registrar");
        return;
      }

      if (res.ok) {
        mostrarNotificacion(); //llama la notificacion
      } else {
        alert(result.error || "Error al registrar");
      }
    } catch (err) {
      console.error("Error en registro:", err);
      alert("No se pudo conectar con el servidor");
    }
  });
});
