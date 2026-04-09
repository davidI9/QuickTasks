#pragma once

#include <string>

namespace application::commands {

struct EditTaskBarCommand {
    std::string taskUuid;
    std::string newName;
    std::string newDueDate;
    bool newCompleted{};
};

} // namespace application::commands
