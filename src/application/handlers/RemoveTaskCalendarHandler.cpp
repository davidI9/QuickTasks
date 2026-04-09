#include "RemoveTaskCalendarHandler.hpp"

#include "application/CalendarFromRepository.hpp"
#include "domain/value_objects/TaskId.hpp"

namespace application {

RemoveTaskCalendarHandler::RemoveTaskCalendarHandler(domain::ITaskListRepository& taskListRepository)
    : tasks_(taskListRepository) {}

domain::Calendar RemoveTaskCalendarHandler::handle(const commands::RemoveTaskCalendarCommand& cmd) {
    tasks_.removeTask(domain::TaskId(cmd.taskUuid));
    return calendarForMonth(tasks_, cmd.monthYear);
}

} // namespace application
