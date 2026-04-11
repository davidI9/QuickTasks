#include "SetFeaturedTaskHandler.hpp"

#include "domain/value_objects/TaskId.hpp"

namespace application {

SetFeaturedTaskHandler::SetFeaturedTaskHandler(domain::ITaskListRepository& taskListRepository, domain::IFeaturedTaskRepository& featuredTaskRepository)
    : tasks_(taskListRepository), featured_(featuredTaskRepository) {}

domain::TaskList SetFeaturedTaskHandler::handle(const commands::SetFeaturedTaskCommand& cmd) {
    featured_.saveFeatured(domain::TaskId(cmd.taskUuid));
    return tasks_.load();
}

} // namespace application
