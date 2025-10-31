//carga primero el dom, define redireccion, notificacion, escucha el click
document.addEventListener("DOMContentLoaded", () => {
  let redireccion; // ✅ variable global

  function mostrarNotificacion() {
    const mensaje = `✅ Sesión cerrada<br>
    Serás redirigido a la página de inicio en unos segundos...<br><br>
    <button id="btnIrInicio" class="btn btn-light">Ir ahora</button>`;
    const notificacion = document.getElementById("notificacion");
    notificacion.innerHTML = mensaje;
    notificacion.classList.remove("oculto");
    notificacion.classList.add("visible");

    document.getElementById("btnIrInicio").addEventListener("click", () => {
      clearTimeout(redireccion);
      window.location.href = "/inicio";
    });
  }

  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("token"); //quita el token
    mostrarNotificacion(); // llama notificacion

    redireccion = setTimeout(() => {
      window.location.href = "/inicio";
    }, 8000); //redireccion
  });
});
