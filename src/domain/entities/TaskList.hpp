#pragma once

#include "Task.hpp"
#include "TaskNode.hpp"

#include <memory>

namespace domain {

class TaskList {
public:
    void insert(Task task);
    [[nodiscard]] bool remove(const TaskId& id);
    [[nodiscard]] Task* findByUuid(const TaskId& id) noexcept;

    [[nodiscard]] bool setTaskName(const TaskId& id, TaskName name);
    [[nodiscard]] bool setTaskDueDate(const TaskId& id, TaskDueDate dueDate);
    [[nodiscard]] bool setTaskCompleted(const TaskId& id, TaskCompleted completed);

    template <typename F>
    void forEachTask(F&& fn) const {
        for (auto cur = head_; cur; cur = cur->next) {
            fn(cur->task);
        }
    }

    /// Stops early if the visitor returns false (useful for sorted traversal).
    template <typename F>
    void forEachTaskWhile(F&& fn) const {
        for (auto cur = head_; cur; cur = cur->next) {
            if (!fn(cur->task)) {
                break;
            }
        }
    }

    [[nodiscard]] std::shared_ptr<TaskNode> head() const noexcept { return head_; }
    [[nodiscard]] std::shared_ptr<TaskNode> tail() const noexcept { return tail_; }
    [[nodiscard]] bool empty() const noexcept { return !head_; }

private:
    std::shared_ptr<TaskNode> head_;
    std::shared_ptr<TaskNode> tail_;
};

} // namespace domain
