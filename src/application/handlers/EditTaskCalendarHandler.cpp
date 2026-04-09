#include "EditTaskCalendarHandler.hpp"

#include "application/CalendarFromRepository.hpp"
#include "domain/entities/Task.hpp"
#include "domain/value_objects/TaskCompleted.hpp"
#include "domain/value_objects/TaskDueDate.hpp"
#include "domain/value_objects/TaskId.hpp"
#include "domain/value_objects/TaskName.hpp"

#include <stdexcept>

namespace application {

EditTaskCalendarHandler::EditTaskCalendarHandler(domain::ITaskListRepository& taskListRepository)
    : tasks_(taskListRepository) {}

domain::Calendar EditTaskCalendarHandler::handle(const commands::EditTaskCalendarCommand& cmd) {
    domain::TaskList list = tasks_.load();
    const domain::TaskId id(cmd.taskUuid);
    if (list.findByUuid(id) == nullptr) {
        throw std::runtime_error("EditTaskCalendarHandler: task not found");
    }

    const domain::Task updated(
        id,
        domain::TaskName(cmd.newName),
        domain::TaskDueDate(cmd.newDueDate),
        domain::TaskCompleted{cmd.newCompleted});

    tasks_.updateTask(updated);
    return calendarForMonth(tasks_, cmd.monthYear);
}

} // namespace application
