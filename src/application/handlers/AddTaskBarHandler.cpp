#include "AddTaskBarHandler.hpp"

#include "domain/entities/Task.hpp"
#include "domain/value_objects/TaskCompleted.hpp"
#include "domain/value_objects/TaskDueDate.hpp"
#include "domain/value_objects/TaskId.hpp"
#include "domain/value_objects/TaskName.hpp"

namespace application {

AddTaskBarHandler::AddTaskBarHandler(domain::ITaskListRepository& taskListRepository) : tasks_(taskListRepository) {}

domain::TaskList AddTaskBarHandler::handle(const commands::AddTaskBarCommand& cmd) {
    domain::Task task(
        domain::TaskId(),
        domain::TaskName(cmd.name),
        domain::TaskDueDate(cmd.dueDate),
        domain::TaskCompleted{false});

    tasks_.addTask(task);
    return tasks_.load();
}

} // namespace application
