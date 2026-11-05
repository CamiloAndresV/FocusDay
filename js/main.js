
 // Ocultar alerta de error y resetear formulario al cerrar o cancelar modal
function limpiarModal() {
  const alertError = document.querySelector('#alertError');
  const formNuevaTarea = document.querySelector('#formNuevaTarea');
  alertError.classList.add('d-none');
  formNuevaTarea.reset();
}

// Función obligatoria exigida por la guía para validar las entradas
function validFormFieldInput(data) {
  const { titulo, estado, descripcion, fecha, prioridad } = data;
  if (
    !titulo || titulo.trim() === '' ||
    !estado || estado.trim() === '' ||
    !descripcion || descripcion.trim() === '' ||
    !fecha || fecha.trim() === '' ||
    !prioridad || prioridad.trim() === ''
  ) {
    return false;
  }
  // Validación de fecha no pasada (comparación contra el inicio del día de hoy)
  const fechaSeleccionada = new Date(`${fecha}T00:00:00`);
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  if (fechaSeleccionada < inicioHoy) {
    return false; // Es una fecha pasada
  }
  return true;
}

function pintarTarea(data) {
  const { titulo, estado, descripcion, fecha, prioridad } = data;
  const contenedorTareas = document.querySelector('#contenedorTareas');
  if (!contenedorTareas) {
    return; // Si no se encuentra el contenedor, salir de la función
  }

    // Formatear texto a minúsculas para comparaciones seguras de clases CSS
  const estadoLower = estado.toLowerCase();
  const prioridadLower = prioridad.toLowerCase();

  // Mapeo de colores según estado y prioridad
  const bgEstado = estadoLower === 'pendiente' ? 'danger' : estadoLower === 'en-proceso' || estadoLower === 'en proceso' ? 'primary' : 'success';
  const bgPrioridad = prioridadLower === 'alta' ? 'danger' : prioridadLower === 'media' ? 'warning' : 'success';

  // Capitalizar texto para mostrarlo bonito en la tarjeta
  const estadoTexto = estado.charAt(0).toUpperCase() + estado.slice(1);
  const prioridadTexto = prioridad.charAt(0).toUpperCase() + prioridad.slice(1);

  // Lógica para pintar la tarea en el DOM
  const tarea = document.createElement('div');
  tarea.className = 'col';
  // Aquí se puede agregar el contenido de la tarea al elemento creado
  tarea.innerHTML = `
  <article class="card h-100 p-3 border-2 border-dark task-card">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span class="badge bg-${bgEstado} text-white border badge-estado-click" title="Clic para cambiar estado">${estadoTexto}</span>
      <span class="small text-muted">${fecha}</span>
    </div>
    <div data-bs-toggle="modal" data-bs-target="#modalDetalleTarea">
      <h2 class="h6 fw-bold text-truncate-title" title="${titulo}">${titulo}</h2>
      <p class="card-text small text-muted text-truncate-description">${descripcion}</p>
    </div>
    <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
      <span class="badge bg-${bgPrioridad} text-white">${prioridadTexto}</span>
      <button type="button" class="btn text-danger p-0 border-0" title="Editar tarea" onclick="event.stopPropagation();">Editar</button>
      <button type="button" class="btn text-danger p-0 border-0" title="Eliminar tarea" onclick="event.stopPropagation();">Eliminar</button>
    </div>
  </article>
  `
  contenedorTareas.appendChild(tarea);
}


document.addEventListener('DOMContentLoaded', function () {
  // Captura de elementos del DOM
  const formNuevaTarea = document.querySelector('#formNuevaTarea');
  const alertError = document.querySelector('#alertError');
  const modalFormulario = document.querySelector('#modalFormularioTarea');
  const modalExito = document.querySelector('#modalExito');
  const btnCancelar = document.querySelector('#btnCancelar');
  const btnEntendido = document.querySelector('#btnEntendido');
  const inputFechaFin = document.querySelector('#fechafin');

  if (btnEntendido) {
    btnEntendido.addEventListener('click', function () {
      this.blur(); // Quita el foco del botón antes de que la modal se oculte
    });
  }

//   Establecer la fecha mínima del campo de fecha al día actual
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  const fechaHoyString = `${yyyy}-${mm}-${dd}`; // Formato YYYY-MM-DD

  if (inputFechaFin) {
    inputFechaFin.setAttribute('min', fechaHoyString);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', limpiarModal);
  }

  if (modalFormulario) {
    modalFormulario.addEventListener('hidden.bs.modal', limpiarModal);
  }

  // Evento submit del formulario
  if (formNuevaTarea) {
    formNuevaTarea.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevenir recarga de página

      // Extracción de datos
      const dataFormulario = {
        titulo: document.querySelector('#tituloTarea').value,
        estado: document.querySelector('#estadoTarea').value,
        descripcion: document.querySelector('#descripcion').value,
        fecha: document.querySelector('#fechafin').value,
        prioridad: document.querySelector('#prioridad').value
      };

      console.log("Comprobando datos:", dataFormulario);

      // Evaluación con la función obligatoria
      const esValido = validFormFieldInput(dataFormulario);

      if (!esValido) {
        // CASO INVÁLIDO: Muestra la alerta roja de error
        alertError.classList.remove('d-none');
      } else {
        // CASO VÁLIDO: Oculta la alerta de error
        alertError.classList.add('d-none');

        // 1. Ocultar la modal del formulario usando la API de Bootstrap
        const instanceModalForm = bootstrap.Modal.getInstance(modalFormulario) || new bootstrap.Modal(modalFormulario);
        instanceModalForm.hide();

        // 2. Pintar la tarea en el DOM
        pintarTarea(dataFormulario);

        // 3. Limpiar campos del formulario
        formNuevaTarea.reset();

        // 4. Mostrar la modal de éxito
        const instanceModalExito = new bootstrap.Modal(modalExito);
        instanceModalExito.show();
        
      }
    });
  }
});