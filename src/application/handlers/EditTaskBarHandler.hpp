#pragma once

#include "application/commands/EditTaskBarCommand.hpp"
#include "domain/entities/TaskList.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class EditTaskBarHandler {
public:
    explicit EditTaskBarHandler(domain::ITaskListRepository& taskListRepository);

    [[nodiscard]] domain::TaskList handle(const commands::EditTaskBarCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
};

} // namespace application
