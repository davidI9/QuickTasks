#pragma once

namespace domain {

/// Completion flag; explicit construction from bool keeps intent clear at call sites.
class TaskCompleted {
public:
    explicit TaskCompleted(bool completed) noexcept : value_(completed) {}

    [[nodiscard]] bool value() const noexcept { return value_; }

private:
    bool value_;
};

} // namespace domain
