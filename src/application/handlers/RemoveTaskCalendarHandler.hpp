#pragma once

#include "application/commands/RemoveTaskCalendarCommand.hpp"
#include "domain/entities/Calendar.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class RemoveTaskCalendarHandler {
public:
    explicit RemoveTaskCalendarHandler(domain::ITaskListRepository& taskListRepository);

    [[nodiscard]] domain::Calendar handle(const commands::RemoveTaskCalendarCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
};

} // namespace application
