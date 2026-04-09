#pragma once

#include "application/commands/GetCalendarCommand.hpp"
#include "domain/entities/Calendar.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

class GetCalendarHandler {
public:
    explicit GetCalendarHandler(domain::ITaskListRepository& taskListRepository);

    [[nodiscard]] domain::Calendar handle(const commands::GetCalendarCommand& cmd);

private:
    domain::ITaskListRepository& tasks_;
};

} // namespace application
