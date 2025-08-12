// Menú desplegable
document.getElementById("menu-toggle").addEventListener("click", () => {
  const menu = document.getElementById("menu-options");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

// Manejo del formulario
document.getElementById("form-reporte").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Reporte enviado correctamente.");
  this.reset();
});

// Botón de eliminar
document.querySelector(".eliminar").addEventListener("click", function () {
  if (confirm("¿Seguro que deseas eliminar el reporte?")) {
    document.getElementById("form-reporte").reset();
    alert("Reporte eliminado.");
  }
});
