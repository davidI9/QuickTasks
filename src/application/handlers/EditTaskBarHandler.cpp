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
    if (list.findByUuid(id) == nullptr) {
        throw std::runtime_error("EditTaskBarHandler: task not found");
    }

    const domain::Task updated(
        id,
        domain::TaskName(cmd.newName),
        domain::TaskDueDate(cmd.newDueDate),
        domain::TaskCompleted{cmd.newCompleted});

    tasks_.updateTask(updated);
    return tasks_.load();
}

} // namespace application
