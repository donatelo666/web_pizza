console.log("Script cargado");
const sanitize = (str) => str.replace(/[<>"'`]/g, "");
function mostrarNotificacion() {
  const mensaje = `✅ Registro de usuario completado con éxito<br> ahora puedes hacer login y ordenar`;
  const notificacion = document.getElementById("notificacion");
  notificacion.innerHTML = mensaje;
  notificacion.classList.remove("oculto"); //quita el oculto del div que contiene la notificaion
  notificacion.classList.add("visible"); // define funcion que muestra una notificacion
  //  con estilos
  //mensaje para el usuario , la pone en modo "visible"

  // Ocultar después de 25 segundos , remueve visible despues de 25 segundos y pone oculto
  // a la notificacion
  setTimeout(() => {
    notificacion.classList.remove("visible");
    notificacion.classList.add("oculto");
  }, 25000);
}

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
        mostrarNotificacion();
      } else {
        alert(result.error || "Error al registrar");
      }
    } catch (err) {
      console.error("Error en registro:", err);
      alert("No se pudo conectar con el servidor");
    }
  });
});
