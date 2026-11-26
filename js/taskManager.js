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

    deleteTask(taskId) {
        const newTasks = []

        for (let task of this.tasks) {
            if (task.id !== taskId) {
                newTasks.push(task)
            }
        }
        this.tasks = newTasks
    }

    save() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks))
        localStorage.setItem("currentId", String(this.currentId))
    }

    load() {
        const savedTasks = localStorage.getItem("tasks")
        const savedId = localStorage.getItem("currentId")

        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks)
        }
        if (savedId) {
            this.currentId = Number(savedId)
        }

    }

    render() {
        const contenedorTareas = document.querySelector('#contenedorTareas')

        if (!contenedorTareas) {
            return
        }

        contenedorTareas.innerHTML = ''
        for(let task of this.tasks) {
            pintarTarea(task)
        }
    }
}