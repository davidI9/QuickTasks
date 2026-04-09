#pragma once

#include <string>
#include <string_view>

namespace domain {

/// Task title, at most 60 characters.
class TaskName {
public:
    static constexpr std::size_t kMaxLength = 60;

    explicit TaskName(std::string_view text);

    [[nodiscard]] const std::string& value() const noexcept { return value_; }

private:
    std::string value_;
};

} // namespace domain
