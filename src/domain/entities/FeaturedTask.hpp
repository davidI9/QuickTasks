#pragma once

#include "domain/value_objects/TaskId.hpp"

#include <optional>

namespace domain {

/// Holds the currently featured (active bar) task id; optional when none is set.
class FeaturedTask {
public:
    FeaturedTask() = default;

    [[nodiscard]] bool hasValue() const noexcept { return id_.has_value(); }
    [[nodiscard]] const TaskId& id() const;
    void set(TaskId id);
    void clear() noexcept { id_.reset(); }

private:
    std::optional<TaskId> id_;
};

} // namespace domain
