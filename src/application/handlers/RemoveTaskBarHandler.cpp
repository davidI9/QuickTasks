#include "RemoveTaskBarHandler.hpp"

#include "domain/value_objects/TaskId.hpp"

namespace application {

RemoveTaskBarHandler::RemoveTaskBarHandler(domain::ITaskListRepository& taskListRepository)
    : tasks_(taskListRepository) {}

domain::TaskList RemoveTaskBarHandler::handle(const commands::RemoveTaskBarCommand& cmd) {
    tasks_.removeTask(domain::TaskId(cmd.taskUuid));
    return tasks_.load();
}

} // namespace application
