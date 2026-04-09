#pragma once

#include <string>

namespace application::commands {

struct EditTaskCalendarCommand {
    std::string taskUuid;
    std::string newName;
    std::string newDueDate;
    bool newCompleted{};
    std::string monthYear;
};

} // namespace application::commands
