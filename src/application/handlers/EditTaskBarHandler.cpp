#include "EditTaskBarHandler.hpp"

#include "domain/entities/Task.hpp"
#include "domain/value_objects/TaskCompleted.hpp"
#include "domain/value_objects/TaskDueDate.hpp"
#include "domain/value_objects/TaskId.hpp"
#include "domain/value_objects/TaskName.hpp"

#include <stdexcept>

namespace application {

EditTaskBarHandler::EditTaskBarHandler(domain::ITaskListRepository& taskListRepository) : tasks_(taskListRepository) {}

domain::TaskList EditTaskBarHandler::handle(const commands::EditTaskBarCommand& cmd) {
    domain::TaskList list = tasks_.load();
    const domain::TaskId id(cmd.taskUuid);
    domain::Task* existingTask = list.findByUuid(id);
    if (!existingTask) {
        throw std::runtime_error("EditTaskBarHandler: task not found");
    }

    // Create a copy to modify
    domain::Task updated = *existingTask;

    // Update only provided fields
    if (cmd.newName.has_value()) {
        updated.setName(domain::TaskName(*cmd.newName));
    }
    if (cmd.newDueDate.has_value()) {
        updated.setDueDate(domain::TaskDueDate(*cmd.newDueDate));
        
        // Re-insert to maintain order. Si devuelve false, cortamos de raíz.
        if (!list.remove(id)) {
            throw std::runtime_error("Error interno: No se pudo eliminar la tarea de la lista para reordenarla.");
        }
        
        list.insert(std::move(updated));
        tasks_.save(list);
        return tasks_.load();
    }
    if (cmd.newCompleted.has_value()) {
        updated.setCompleted(domain::TaskCompleted(*cmd.newCompleted));
    }

    // If due date changed, we already handled re-insertion
    if (!cmd.newDueDate.has_value()) {
        tasks_.updateTask(updated);
    }

    return tasks_.load();
}

} // namespace application
