#pragma once

#include "application/commands/RemoveTaskBarCommand.hpp"
#include "domain/entities/TaskList.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class RemoveTaskBarHandler {
public:
    explicit RemoveTaskBarHandler(domain::ITaskListRepository& taskListRepository);

    [[nodiscard]] domain::TaskList handle(const commands::RemoveTaskBarCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
};

} // namespace application
