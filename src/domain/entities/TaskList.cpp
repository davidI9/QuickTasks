#include "TaskList.hpp"

namespace domain {

void TaskList::insert(Task task) {
    auto newNode = std::make_shared<TaskNode>(std::move(task));

    if (!head_) {
        head_ = tail_ = newNode;
        return;
    }

    auto cur = head_;
    while (cur) {
        const auto& curDue = cur->task.dueDate();
        const auto& newDue = newNode->task.dueDate();

        if (newDue < curDue || newDue == curDue) {
            newNode->next = cur;
            newNode->prev = cur->prev;

            if (auto prevShared = cur->prev.lock()) {
                prevShared->next = newNode;
            } else {
                head_ = newNode;
            }

            cur->prev = newNode;
            return;
        }

        if (!cur->next) {
            break;
        }
        cur = cur->next;
    }

    newNode->prev = cur;
    cur->next = newNode;
    tail_ = newNode;
}

bool TaskList::remove(const TaskId& id) {
    for (auto cur = head_; cur; cur = cur->next) {
        if (cur->task.id() != id) {
            continue;
        }

        auto prev = cur->prev.lock();
        auto next = cur->next;

        if (next) {
            next->prev = cur->prev;
        } else {
            tail_ = prev;
        }

        if (prev) {
            prev->next = next;
        } else {
            head_ = next;
        }

        if (!head_) {
            tail_.reset();
        }

        return true;
    }
    return false;
}

Task* TaskList::findByUuid(const TaskId& id) noexcept {
    for (auto cur = head_; cur; cur = cur->next) {
        if (cur->task.id() == id) {
            return &cur->task;
        }
    }
    return nullptr;
}

bool TaskList::setTaskName(const TaskId& id, TaskName name) {
    Task* t = findByUuid(id);
    if (!t) {
        return false;
    }
    t->setName(std::move(name));
    return true;
}

bool TaskList::setTaskDueDate(const TaskId& id, TaskDueDate dueDate) {
    Task* t = findByUuid(id);
    if (!t) {
        return false;
    }
    Task copy = *t;
    copy.setDueDate(std::move(dueDate));
    if (!remove(id)) {
        return false;
    }
    insert(std::move(copy));
    return true;
}

bool TaskList::setTaskCompleted(const TaskId& id, TaskCompleted completed) {
    Task* t = findByUuid(id);
    if (!t) {
        return false;
    }
    t->setCompleted(completed);
    return true;
}

} // namespace domain
