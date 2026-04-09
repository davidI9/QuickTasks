#include "SetFeaturedTaskHandler.hpp"

#include "domain/value_objects/TaskId.hpp"

namespace application {

SetFeaturedTaskHandler::SetFeaturedTaskHandler(domain::IFeaturedTaskRepository& featuredTaskRepository)
    : featured_(featuredTaskRepository) {}

void SetFeaturedTaskHandler::handle(const commands::SetFeaturedTaskCommand& cmd) {
    featured_.saveFeatured(domain::TaskId(cmd.taskUuid));
}

} // namespace application
