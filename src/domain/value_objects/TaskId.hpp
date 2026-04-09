#pragma once

#include <string>
#include <string_view>

namespace domain {

/// Immutable task identifier (UUID v4 string). Generated on construction.
class TaskId {
public:
    TaskId();
    explicit TaskId(std::string_view uuid);

    [[nodiscard]] const std::string& value() const noexcept { return value_; }

    [[nodiscard]] bool operator==(const TaskId& o) const noexcept { return value_ == o.value_; }
    [[nodiscard]] bool operator!=(const TaskId& o) const noexcept { return !(*this == o); }

private:
    static std::string generateUuidV4();

    std::string value_;
};

} // namespace domain
