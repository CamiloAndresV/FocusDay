const taskManager = new TaskManager();
let tareaIdAEliminar = null; // Almacena temporalmente el ID de la tarea pendiente por confirmar

// Ocultar alerta de error y resetear formulario al cerrar o cancelar modal
function limpiarModal() {
  const alertError = document.querySelector('#alertError');
  const formNuevaTarea = document.querySelector('#formNuevaTarea');
  if (alertError) alertError.classList.add('d-none');
  if (formNuevaTarea) formNuevaTarea.reset();
}

// Función para validar las entradas
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

  const fechaSeleccionada = new Date(`${fecha}T00:00:00`);
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  if (fechaSeleccionada < inicioHoy) {
    return false;
  }
  return true;
}

function pintarTarea(data) {
  const { id, titulo, estado, descripcion, fecha, prioridad } = data;
  const contenedorTareas = document.querySelector('#contenedorTareas');
  if (!contenedorTareas) return;

  const estadoLower = estado.toLowerCase();
  const prioridadLower = prioridad.toLowerCase();
  const esCompletada = estadoLower === 'completada';

  const bgEstado = esCompletada ? 'success' : (estadoLower === 'en-proceso' || estadoLower === 'en proceso') ? 'primary' : 'danger';
  const bgPrioridad = prioridadLower === 'alta' ? 'danger' : prioridadLower === 'media' ? 'warning' : 'success';

  const estadoTexto = estado.charAt(0).toUpperCase() + estado.slice(1);
  const prioridadTexto = prioridad.charAt(0).toUpperCase() + prioridad.slice(1);

  const tarea = document.createElement('div');
  tarea.className = 'col';
  tarea.dataset.taskId = id;

  // Sin stopPropagation() en delete-button para que funcione la delegación de eventos
  tarea.innerHTML = `
  <article class="card h-100 p-3 border-2 border-dark task-card">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span class="badge bg-${bgEstado} text-white border badge-estado" title="Clic para cambiar estado">${estadoTexto}</span>
      <div class="form-check form-switch" onclick="event.stopPropagation();">
        <input class="form-check-input switch-tarea-estado" type="checkbox" role="switch" ${esCompletada ? 'checked' : ''} title="Marcar como completada">
      </div>
    </div>

    <div data-bs-toggle="modal" data-bs-target="#modalDetalleTarea">
      <h2 class="h6 fw-bold text-truncate-title" title="${titulo}">${titulo}</h2>
      <p class="card-text small text-muted text-truncate-description">${descripcion}</p>
      <span class="small text-muted">${fecha}</span>
    </div>
    <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
      <span class="badge bg-${bgPrioridad} text-white">${prioridadTexto}</span>
      <button type="button" class="btn text-danger p-0 border-0" title="Editar tarea" onclick="event.stopPropagation();">Editar</button>
      <button type="button" class="btn text-danger p-0 border-0 delete-button" title="Eliminar tarea">Eliminar</button>
    </div>
  </article>
  `;

  if (esCompletada) {
    actualizarEstadoTarea(tarea, true);
  }

  contenedorTareas.appendChild(tarea);
}

// Función toggle para alternar entre Pendiente / Completada
function actualizarEstadoTarea(colElemento, estaCompletada) {
  const card = colElemento.querySelector('.card');
  const badgeEstado = colElemento.querySelector('.badge-estado');
  const titulo = colElemento.querySelector('h2');
  const descripcion = colElemento.querySelector('p.card-text');

  if (!card || !badgeEstado || !titulo) return;

  if (estaCompletada) {
    badgeEstado.textContent = 'Completada';
    badgeEstado.className = 'badge bg-success text-white border badge-estado';
    card.classList.add('bg-light', 'opacity-75');
    titulo.classList.add('text-decoration-line-through', 'text-muted');
    if (descripcion) descripcion.classList.add('text-decoration-line-through', 'text-muted');
  } else {
    badgeEstado.textContent = 'Pendiente';
    badgeEstado.className = 'badge bg-danger text-white border badge-estado';
    card.classList.remove('bg-light', 'opacity-75');
    titulo.classList.remove('text-decoration-line-through', 'text-muted');
    if (descripcion) descripcion.classList.remove('text-decoration-line-through', 'text-muted');
  }
}

// Función para actualizar los datos dentro de la modal de detalle
function cargarDetalleModal(colElemento) {
  const modalDetalleTarea = document.querySelector('#modalDetalleTarea');
  const badgeEstado = colElemento.querySelector('.badge-estado');
  const badgePrioridad = colElemento.querySelector('.badge-prioridad') || colElemento.querySelectorAll('.badge')[1];
  const titulo = colElemento.querySelector('h2');
  const descripcion = colElemento.querySelector('p.card-text');
  const fecha = colElemento.querySelector('span.small.text-muted');

  const detalleEstado = document.querySelector('#detalleEstado');
  const detallePrioridad = document.querySelector('#detallePrioridad');
  const detalleTitulo = document.querySelector('#detalleTitulo');
  const detalleDescripcion = document.querySelector('#detalleDescripcion');
  const detalleFecha = document.querySelector('#detalleFecha');

  // Guardamos el ID de la tarea abierta en la modal de detalle
  if (modalDetalleTarea && colElemento.dataset.taskId) {
    modalDetalleTarea.dataset.taskId = colElemento.dataset.taskId;
  }

  if (detalleEstado && badgeEstado) {
    detalleEstado.textContent = badgeEstado.textContent;
    detalleEstado.className = badgeEstado.className;
  }
  if (detallePrioridad && badgePrioridad) {
    detallePrioridad.textContent = badgePrioridad.textContent;
    detallePrioridad.className = badgePrioridad.className;
  }
  if (detalleTitulo && titulo) detalleTitulo.textContent = titulo.textContent;
  if (detalleDescripcion && descripcion) detalleDescripcion.textContent = descripcion.textContent;
  if (detalleFecha && fecha) detalleFecha.textContent = fecha.textContent;
}

document.addEventListener('DOMContentLoaded', function () {
  const formNuevaTarea = document.querySelector('#formNuevaTarea');
  const alertError = document.querySelector('#alertError');
  const modalFormulario = document.querySelector('#modalFormularioTarea');
  const modalDetalleTarea = document.querySelector('#modalDetalleTarea');
  const modalExito = document.querySelector('#modalExito');
  const modalConfirmarEliminar = document.querySelector('#modalConfirmarEliminar');
  const btnConfirmarEliminar = document.querySelector('#btnConfirmarEliminar');
  const btnEliminarTareaModal = document.querySelector('#btnEliminarTareaModal');
  const btnCancelar = document.querySelector('#btnCancelar');
  const btnEntendido = document.querySelector('#btnEntendido');
  const inputFechaFin = document.querySelector('#fechafin');
  const contenedorTareas = document.querySelector('#contenedorTareas');

  // Cargar tareas o migrar las iniciales del HTML la primera vez
  taskManager.load();

  if (!localStorage.getItem('tasks') && contenedorTareas) {
    const tarjetasIniciales = contenedorTareas.querySelectorAll('.col');
    tarjetasIniciales.forEach(col => {
      const titulo = col.querySelector('h2')?.textContent.trim() || '';
      const estado = col.querySelector('.badge-estado-click, .badge-estado')?.textContent.trim() || 'Pendiente';
      const descripcion = col.querySelector('p.card-text')?.textContent.trim() || '';
      const fecha = col.querySelector('span.small.text-muted')?.textContent.trim() || '';
      const prioridad = col.querySelectorAll('.badge')[1]?.textContent.trim() || 'Media';

      taskManager.addTask(titulo, estado, descripcion, fecha, prioridad);
    });
    taskManager.save();
  }

  taskManager.render();

  if (btnEntendido) {
    btnEntendido.addEventListener('click', function () {
      this.blur(); // Quita el foco del botón antes de que la modal se oculte
    });
  }

  // Fecha mínima de hoy en el formulario
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  const fechaHoyString = `${yyyy}-${mm}-${dd}`;

  if (inputFechaFin) {
    inputFechaFin.setAttribute('min', fechaHoyString);
  }

  document.addEventListener('hide.bs.modal', function () {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  if (btnCancelar) {
    btnCancelar.addEventListener('click', limpiarModal);
  }

  if (modalFormulario) {
    modalFormulario.addEventListener('hidden.bs.modal', limpiarModal);
  }

  // Función auxiliar para abrir la modal de confirmación
  function solicitarConfirmacionEliminar(taskId) {
    tareaIdAEliminar = taskId;
    if (modalConfirmarEliminar) {
      const instanceConfirmar = bootstrap.Modal.getInstance(modalConfirmarEliminar) || new bootstrap.Modal(modalConfirmarEliminar);
      instanceConfirmar.show();
    }
  }

  // Botón Eliminar dentro de la Modal de Detalle
  if (btnEliminarTareaModal && modalDetalleTarea) {
    btnEliminarTareaModal.addEventListener('click', function () {
      const taskId = Number(modalDetalleTarea.dataset.taskId);
      if (taskId) {
        // Cerramos la modal de detalle y abrimos la de confirmación
        const instanceDetalle = bootstrap.Modal.getInstance(modalDetalleTarea);
        if (instanceDetalle) instanceDetalle.hide();
        solicitarConfirmacionEliminar(taskId);
      }
    });
  }

  // Botón Confirmar dentro de la Modal de Confirmación
  if (btnConfirmarEliminar) {
    btnConfirmarEliminar.addEventListener('click', function () {
      if (tareaIdAEliminar !== null) {
        taskManager.deleteTask(tareaIdAEliminar);
        taskManager.save();
        taskManager.render();
        tareaIdAEliminar = null;
      }
      const instanceConfirmar = bootstrap.Modal.getInstance(modalConfirmarEliminar);
      if (instanceConfirmar) instanceConfirmar.hide();
    });
  }

  // Delegación de eventos en #contenedorTareas
  if (contenedorTareas) {
    contenedorTareas.addEventListener('change', function (event) {
      if (event.target.classList.contains('form-check-input') || event.target.classList.contains('switch-tarea-estado')) {
        const colElemento = event.target.closest('.col');
        if (colElemento) {
          actualizarEstadoTarea(colElemento, event.target.checked);

          if (colElemento.dataset.taskId) {
            const taskId = Number(colElemento.dataset.taskId);
            const tareaObj = taskManager.tasks.find(t => t.id === taskId);
            if (tareaObj) {
              tareaObj.estado = event.target.checked ? 'Completada' : 'Pendiente';
              taskManager.save();
            }
          }
        }
      }
    });

    contenedorTareas.addEventListener('click', function (event) {
      // Clic en botón Eliminar de la tarjeta
      if (event.target.classList.contains('delete-button')) {
        const pTask = event.target.closest('.col');
        if (pTask && pTask.dataset.taskId) {
          solicitarConfirmacionEliminar(Number(pTask.dataset.taskId));
        }
        return;
      }

      // Clic para abrir modal de detalles
      const zonaDetalles = event.target.closest('[data-bs-target="#modalDetalleTarea"]');
      if (zonaDetalles) {
        const colElemento = zonaDetalles.closest('.col');
        if (colElemento) {
          cargarDetalleModal(colElemento);
        }
      }
    });
  }

  // Evento submit del formulario
  if (formNuevaTarea) {
    formNuevaTarea.addEventListener('submit', function (event) {
      event.preventDefault();

      const dataFormulario = {
        titulo: document.querySelector('#tituloTarea').value,
        estado: document.querySelector('#estadoTarea').value,
        descripcion: document.querySelector('#descripcion').value,
        fecha: document.querySelector('#fechafin').value,
        prioridad: document.querySelector('#prioridad').value
      };

      const esValido = validFormFieldInput(dataFormulario);

      if (!esValido) {
        if (alertError) alertError.classList.remove('d-none');
      } else {
        if (alertError) alertError.classList.add('d-none');

        taskManager.addTask(
          dataFormulario.titulo,
          dataFormulario.estado,
          dataFormulario.descripcion,
          dataFormulario.fecha,
          dataFormulario.prioridad
        );

        taskManager.save();
        taskManager.render();
        formNuevaTarea.reset();

        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        const instanceModalExito = new bootstrap.Modal(modalExito);
        instanceModalExito.show();
      }
    });
  }
});