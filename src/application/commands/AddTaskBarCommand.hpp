#pragma once

#include <string>

namespace application::commands {

struct AddTaskBarCommand {
    std::string name;
    std::string dueDate;
};

} // namespace application::commands
