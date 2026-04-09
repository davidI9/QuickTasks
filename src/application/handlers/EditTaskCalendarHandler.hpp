#pragma once

#include "application/commands/EditTaskCalendarCommand.hpp"
#include "domain/entities/Calendar.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class EditTaskCalendarHandler {
public:
    explicit EditTaskCalendarHandler(domain::ITaskListRepository& taskListRepository);

    [[nodiscard]] domain::Calendar handle(const commands::EditTaskCalendarCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
};

} // namespace application
