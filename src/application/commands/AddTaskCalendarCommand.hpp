#pragma once

#include <string>

namespace application::commands {

struct AddTaskCalendarCommand {
    std::string name;
    std::string dueDate;
    std::string monthYear;
};

} // namespace application::commands
