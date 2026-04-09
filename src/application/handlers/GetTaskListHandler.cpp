#include "GetTaskListHandler.hpp"

namespace application {

GetTaskListHandler::GetTaskListHandler(domain::ITaskListRepository& taskListRepository) : tasks_(taskListRepository) {}

domain::TaskList GetTaskListHandler::handle(const commands::GetTaskListCommand&) {
    return tasks_.load();
}

} // namespace application
