//script de login con token , sanitizacion de datos, notificacion

const sanitize2 = (str) => str.replace(/[<>"'`]/g, ""); //sanitizacion de ingreso de datos

function mostrarNotificacion2() {
  const mensaje = `✅ Bienvenido <br>
    Has iniciado sesión correctamente.<br><br>
    Serás redirigido a la página de ordenes en unos segundos...<br><br>
    <button id="btnIrEditar" class="btn btn-light">Ir ahora</button>`;
  const notificacion = document.getElementById("notificacion2");
  notificacion.innerHTML = mensaje;
  notificacion.classList.remove("oculto"); //quita el oculto
  notificacion.classList.add("visible"); // pone
  //  con estilos
}
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) {
    console.error("Formulario login no encontrado");
    return;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //escucha el submit con prevent default

    const formData = new FormData(e.target);
    const data = {
      nombre: sanitize2(formData.get("nombre")),
      password: sanitize2(formData.get("password")),
    };

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await res.json();
      } catch (err) {
        console.error("Respuesta inesperada:");
        alert("Error inesperado al iniciar sesión");
        return;
      }

      if (res.ok && result.token) {
        localStorage.setItem("token", result.token); //pone el token
        mostrarNotificacion2(); //llama la notificacion

        const redireccion = setTimeout(() => {
          window.location.href = "/editar";
        }, 10000); //redireccion

        document.getElementById("btnIrEditar").addEventListener("click", () => {
          clearTimeout(redireccion);
          window.location.href = "/editar"; //escucha evento click
        });
      } else {
        alert(result.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("Error en login:", err);
      alert("Error inesperado al iniciar sesión");
    }
  });
});
