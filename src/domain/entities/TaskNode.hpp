#pragma once

#include "Task.hpp"

#include <memory>

namespace domain {

/// Doubly linked list node: `next` owns the successor; `prev` is weak to break cycles.
struct TaskNode {
    explicit TaskNode(Task task) : task(std::move(task)) {}

    Task task;
    std::weak_ptr<TaskNode> prev;
    std::shared_ptr<TaskNode> next;
};

} // namespace domain
