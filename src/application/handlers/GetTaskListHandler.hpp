#pragma once

#include "application/commands/GetTaskListCommand.hpp"
#include "domain/entities/TaskList.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class GetTaskListHandler {
public:
    explicit GetTaskListHandler(domain::ITaskListRepository& taskListRepository);

    [[nodiscard]] domain::TaskList handle(const commands::GetTaskListCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
};

} // namespace application
