#pragma once

#include "application/commands/AddTaskBarCommand.hpp"
#include "domain/entities/TaskList.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class AddTaskBarHandler {
public:
    explicit AddTaskBarHandler(domain::ITaskListRepository& taskListRepository);

    [[nodiscard]] domain::TaskList handle(const commands::AddTaskBarCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
};

} // namespace application
