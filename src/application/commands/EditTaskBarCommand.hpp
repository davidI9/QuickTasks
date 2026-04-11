#pragma once

#include <optional>
#include <string>

namespace application::commands {

struct EditTaskBarCommand {
    std::string taskUuid;
    std::optional<std::string> newName;
    std::optional<std::string> newDueDate;
    std::optional<bool> newCompleted;
};

} // namespace application::commands
