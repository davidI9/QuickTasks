#pragma once

#include "domain/value_objects/TaskCompleted.hpp"
#include "domain/value_objects/TaskDueDate.hpp"
#include "domain/value_objects/TaskId.hpp"
#include "domain/value_objects/TaskName.hpp"

namespace domain {

class Task {
public:
    Task(TaskId id, TaskName name, TaskDueDate dueDate, TaskCompleted completed);

    [[nodiscard]] const TaskId& id() const noexcept { return id_; }
    [[nodiscard]] const TaskName& name() const noexcept { return name_; }
    [[nodiscard]] const TaskDueDate& dueDate() const noexcept { return dueDate_; }
    [[nodiscard]] const TaskCompleted& completed() const noexcept { return completed_; }

    void setName(TaskName name);
    void setDueDate(TaskDueDate dueDate);
    void setCompleted(TaskCompleted completed);

private:
    TaskId id_;
    TaskName name_;
    TaskDueDate dueDate_;
    TaskCompleted completed_;
};

} // namespace domain
