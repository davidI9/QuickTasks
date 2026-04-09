#include "FeaturedTask.hpp"

#include <stdexcept>

namespace domain {

const TaskId& FeaturedTask::id() const {
    if (!id_) {
        throw std::logic_error("FeaturedTask: no task id set");
    }
    return *id_;
}

void FeaturedTask::set(TaskId id) {
    id_ = std::move(id);
}

} // namespace domain
