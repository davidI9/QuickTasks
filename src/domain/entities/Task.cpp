#include "Task.hpp"

namespace domain {

Task::Task(TaskId id, TaskName name, TaskDueDate dueDate, TaskCompleted completed)
    : id_(std::move(id))
    , name_(std::move(name))
    , dueDate_(std::move(dueDate))
    , completed_(completed) {}

void Task::setName(TaskName name) {
    name_ = std::move(name);
}

void Task::setDueDate(TaskDueDate dueDate) {
    dueDate_ = std::move(dueDate);
}

void Task::setCompleted(TaskCompleted completed) {
    completed_ = completed;
}

} // namespace domain
