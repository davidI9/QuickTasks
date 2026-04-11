#include "EditTaskCalendarHandler.hpp"

#include "application/CalendarFromRepository.hpp"
#include "domain/entities/Task.hpp"
#include "domain/value_objects/TaskCompleted.hpp"
#include "domain/value_objects/TaskDueDate.hpp"
#include "domain/value_objects/TaskId.hpp"
#include "domain/value_objects/TaskName.hpp"

#include <stdexcept>

namespace application {

EditTaskCalendarHandler::EditTaskCalendarHandler(domain::ITaskListRepository& taskListRepository)
    : tasks_(taskListRepository) {}

domain::Calendar EditTaskCalendarHandler::handle(const commands::EditTaskCalendarCommand& cmd) {
    domain::TaskList list = tasks_.load();
    const domain::TaskId id(cmd.taskUuid);
    domain::Task* existingTask = list.findByUuid(id);
    if (!existingTask) {
        throw std::runtime_error("EditTaskCalendarHandler: task not found");
    }

    domain::Task updated = *existingTask;

    if (cmd.newName.has_value()) {
        updated.setName(domain::TaskName(*cmd.newName));
    }
    if (cmd.newCompleted.has_value()) {
        updated.setCompleted(domain::TaskCompleted(*cmd.newCompleted));
    }
    if (cmd.newDueDate.has_value()) {
        updated.setDueDate(domain::TaskDueDate(*cmd.newDueDate));
        
        // Re-insert to maintain order. Si devuelve false, cortamos de raíz.
        if (!list.remove(id)) {
            throw std::runtime_error("Error interno: No se pudo eliminar la tarea original para reordenarla.");
        }
        list.insert(std::move(updated));
        tasks_.save(list);
    } else {
        tasks_.updateTask(updated);
    }

    return calendarForMonth(tasks_, cmd.monthYear);
}

} // namespace application
