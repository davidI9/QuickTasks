#include "AddTaskCalendarHandler.hpp"

#include "application/CalendarFromRepository.hpp"
#include "domain/entities/Task.hpp"
#include "domain/value_objects/TaskCompleted.hpp"
#include "domain/value_objects/TaskDueDate.hpp"
#include "domain/value_objects/TaskId.hpp"
#include "domain/value_objects/TaskName.hpp"

namespace application {

AddTaskCalendarHandler::AddTaskCalendarHandler(domain::ITaskListRepository& taskListRepository)
    : tasks_(taskListRepository) {}

domain::Calendar AddTaskCalendarHandler::handle(const commands::AddTaskCalendarCommand& cmd) {
    domain::Task task(
        domain::TaskId(),
        domain::TaskName(cmd.name),
        domain::TaskDueDate(cmd.dueDate),
        domain::TaskCompleted{false});

    tasks_.addTask(task);
    return calendarForMonth(tasks_, cmd.monthYear);
}

} // namespace application
