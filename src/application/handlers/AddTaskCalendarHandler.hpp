#pragma once

#include "application/commands/AddTaskCalendarCommand.hpp"
#include "domain/entities/Calendar.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class AddTaskCalendarHandler {
public:
    explicit AddTaskCalendarHandler(domain::ITaskListRepository& taskListRepository);

    [[nodiscard]] domain::Calendar handle(const commands::AddTaskCalendarCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
};

} // namespace application
