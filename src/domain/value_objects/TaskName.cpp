#include "TaskName.hpp"

#include <stdexcept>

namespace domain {

TaskName::TaskName(std::string_view text) {
    if (text.size() > kMaxLength) {
        throw std::invalid_argument("TaskName: length must be at most 60 characters");
    }
    value_.assign(text.data(), text.size());
}

} // namespace domain
