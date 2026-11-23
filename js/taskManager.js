class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
    }

    // metodo para agregar una tarea
    addTask(titulo, estado = "Pendiente", descripcion, fecha, prioridad = "media") {
        this.currentId++;
        
        const task = {
            id: this.currentId,
            fechaCreacion: new Date().toLocaleString('es-CO'),
            titulo: titulo,
            estado: estado || "Pendiente",
            descripcion: descripcion,
            fecha: fecha,
            prioridad: prioridad
        }
        this.tasks.push(task);
    }
}