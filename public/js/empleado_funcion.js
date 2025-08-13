document.getElementById('form-reporte').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const respuesta = await fetch('https://daltile-sistema-reportes.onrender.com/api/reportes/enviar', {
      method: 'POST',
      body: formData
    });

    if (!respuesta.ok) {
      const error = await respuesta.json().catch(() => ({}));
      throw new Error(error.error || 'Error desconocido del servidor');
    }

    const resultado = await respuesta.json();
    mostrarNotificacion('✅ Reporte enviado correctamente');
    form.reset();
  } catch (error) {
    console.error('Error de red:', error);
    mostrarNotificacion('❌ No se pudo enviar el reporte: ' + error.message, 'error');
  }
});

// Botón eliminar
document.querySelector('.eliminar').addEventListener('click', function () {
  if (confirm ("¿Estás seguro de que deseas eliminar el reporte antes de enviarlo?")) {
    document.getElementById("form-reporte").reset();
    mostrarNotificacion('🗑️ Reporte descartado antes de enviar', 'error');
  }
});

// Función para mostrar notificación estilizada
function mostrarNotificacion(mensaje, tipo = 'exito') {
  const noti = document.getElementById('mensaje-sistema'); // Asegúrate que este ID existe en tu HTML
  if (!noti) {
    console.warn('⚠️ No se encontró el contenedor de notificación (mensaje-sistema)');
    return;
  }

  noti.textContent = mensaje;
  noti.className = `notificacion visible ${tipo}`;

  setTimeout(() => {
    noti.classList.remove('visible');
  }, 3500);
}
