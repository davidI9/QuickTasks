#pragma once

#include "application/commands/SetFeaturedTaskCommand.hpp"
#include "domain/entities/TaskList.hpp"
#include "domain/repositories/IFeaturedTaskRepository.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class SetFeaturedTaskHandler {
public:
    SetFeaturedTaskHandler(domain::ITaskListRepository& taskListRepository, domain::IFeaturedTaskRepository& featuredTaskRepository);

    [[nodiscard]] domain::TaskList handle(const commands::SetFeaturedTaskCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
    domain::IFeaturedTaskRepository& featured_;
};

} // namespace application
