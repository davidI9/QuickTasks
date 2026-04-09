#pragma once

#include <string>

namespace application::commands {

struct RemoveTaskCalendarCommand {
    std::string taskUuid;
    std::string monthYear;
};

} // namespace application::commands
