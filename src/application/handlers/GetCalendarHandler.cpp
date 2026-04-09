#include "GetCalendarHandler.hpp"

#include "application/CalendarFromRepository.hpp"

namespace application {

GetCalendarHandler::GetCalendarHandler(domain::ITaskListRepository& taskListRepository) : tasks_(taskListRepository) {}

domain::Calendar GetCalendarHandler::handle(const commands::GetCalendarCommand& cmd) {
    return calendarForMonth(tasks_, cmd.monthYear);
}

} // namespace application
