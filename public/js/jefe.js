document.addEventListener('DOMContentLoaded', async () => {
  await cargarReportes();
});

async function cargarReportes() {
  const contenedor = document.getElementById('reportes');
  const camara = document.getElementById('filtro-camara')?.value || '';
  const fechaSeleccionada = document.getElementById('filtro-fecha')?.value || '';
  const estado = document.getElementById('filtro-estado')?.value || '';

  try {
    const respuesta = await fetch('https://daltile-sistema-reportes.onrender.com/api/reportes');
    const reportes = await respuesta.json();

    contenedor.innerHTML = '';

    const filtrados = reportes.filter(reporte => {
      const coincideCamara = camara === "" || reporte.camara === camara;
      const coincideFecha = fechaSeleccionada === "" || 
        new Date(reporte.fecha).toISOString().slice(0, 10) === fechaSeleccionada;

      const esNuevo = new Date(reporte.fecha) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const estaCalificado = !!reporte.calificacion;
      const estadoActual = estaCalificado ? 'calificado' : esNuevo ? 'nuevo' : 'pendiente';
      const coincideEstado = estado === '' || estado === estadoActual;

      return coincideCamara && coincideFecha && coincideEstado;
    });

    if (filtrados.length === 0) {
      contenedor.innerHTML = '<p>No hay reportes que coincidan con los filtros seleccionados.</p>';
      return;
    }

    filtrados.forEach(reporte => {
      const div = document.createElement('div');
      div.classList.add('reporte');

      const fechaReporte = new Date(reporte.fecha);
      const esNuevo = fechaReporte > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const estaCalificado = !!reporte.calificacion;

      if (estaCalificado) {
        div.style.borderLeft = '5px solid green';
      } else if (esNuevo) {
        div.style.borderLeft = '5px solid blue';
      } else {
        div.style.borderLeft = '5px solid red';
      }

      function getExtension(filename) {
        const ext = filename.split('.').pop();
        return ext.toUpperCase();
      }

      div.innerHTML = `
        <div class="reporte-encabezado">
          <h3>${reporte.camara.toUpperCase()}</h3>
          <span class="fecha">${fechaReporte.toLocaleString()}</span>
        </div>

        <p><strong>Empleado:</strong> ${reporte.nombreEmpleado}</p>
        <p><strong>Correo:</strong> ${reporte.correoEmpleado || 'No especificado'}</p>
        <p><strong>Funcionamiento:</strong> ${reporte.funcionamiento}</p>
        <p><strong>Imagen:</strong> ${reporte.imagen}</p>
        <p><strong>Movimiento:</strong> ${reporte.movimiento}</p>
        <p><strong>Comentarios:</strong> ${reporte.comentarios}</p>

        <p><strong>Archivo:</strong> 
          <a href="/uploads/${encodeURIComponent(reporte.archivoNombre)}" download>
            Descargar archivo (${getExtension(reporte.archivoNombre)})
          </a>
        </p>

        ${!estaCalificado ? `
        <div class="campo-radio">
          <label><input type="radio" name="calificacion-${reporte._id}" value="bueno"> Bueno</label>
          <label><input type="radio" name="calificacion-${reporte._id}" value="deficiente"> Malo</label>
        </div>

        <textarea placeholder="Comentario del jefe..." id="comentario-${reporte._id}">${reporte.comentarioJefe || ''}</textarea>
        ` : `<p><strong>Calificación:</strong> ${reporte.calificacion}</p>
             <p><strong>Comentario del jefe:</strong><br>${reporte.comentarioJefe || 'Sin comentario'}</p>` }

        <div class="acciones">
          ${!estaCalificado ? `<button class="btn-calificar" onclick="calificarReporte('${reporte._id}')">Calificar</button>` : ''}
          <button class="btn-eliminar" onclick="eliminarReporte('${reporte._id}')">Eliminar</button>
        </div>
      `;

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error('❌ Error al cargar reportes:', error);
    mostrarNotificacionJefe('❌ Error al cargar los reportes', 'error');
  }
}

async function calificarReporte(id) {
  const calificacion = document.querySelector(`input[name="calificacion-${id}"]:checked`);
  const comentario = document.getElementById(`comentario-${id}`).value;

  if (!calificacion) {
    mostrarNotificacionJefe('⚠️ Selecciona una calificación (Bueno o Malo).', 'error');
    return;
  }

  try {
    const respuesta = await fetch(`https://daltile-sistema-reportes.onrender.com/api/reportes/calificar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calificacion: calificacion.value,
        comentarioJefe: comentario
      })
    });

    const resultado = await respuesta.json();

    if (respuesta.ok) {
      mostrarNotificacionJefe('✅ Reporte calificado correctamente');
      cargarReportes();
    } else {
      mostrarNotificacionJefe('❌ Error al calificar: ' + resultado.error, 'error');
    }

  } catch (error) {
    console.error('Error al calificar:', error);
    mostrarNotificacionJefe('❌ Error de red al calificar reporte', 'error');
  }
}

async function eliminarReporte(id) {
  const confirmar = confirm('¿Seguro que deseas eliminar este reporte?');

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`https://daltile-sistema-reportes.onrender.com/api/reportes/${id}`, {
      method: 'DELETE'
    });

    const resultado = await respuesta.json();

    if (respuesta.ok) {
      mostrarNotificacionJefe('🗑️ Reporte eliminado correctamente');
      cargarReportes();
    } else {
      mostrarNotificacionJefe('❌ Error al eliminar: ' + resultado.error, 'error');
    }

  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    mostrarNotificacionJefe('❌ Error de red al eliminar reporte', 'error');
  }
}

function mostrarNotificacionJefe(mensaje, tipo = 'exito') {
  let noti = document.getElementById('mensaje-jefe');

  if (!noti) {
    noti = document.createElement('div');
    noti.id = 'mensaje-jefe';
    noti.className = 'notificacion';
    document.body.appendChild(noti);
  }

  noti.textContent = mensaje;
  noti.className = `notificacion visible ${tipo}`;

  setTimeout(() => {
    noti.classList.remove('visible');
  }, 3500);
}

function filtrarReportes() {
  cargarReportes();
}

// Botón de recarga rápida
document.getElementById('btn-recargar').addEventListener('click', async () => {
  await cargarReportes();
  mostrarNotificacionJefe('🔄 Lista de reportes actualizada');
});
