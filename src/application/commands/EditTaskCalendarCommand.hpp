#pragma once

#include <optional>
#include <string>

namespace application::commands {

struct EditTaskCalendarCommand {
    std::string taskUuid;
    std::optional<std::string> newName;
    std::optional<std::string> newDueDate;
    std::optional<bool> newCompleted;
    std::string monthYear;
};

} // namespace application::commands
