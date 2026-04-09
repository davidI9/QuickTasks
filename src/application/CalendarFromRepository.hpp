#pragma once

#include <string>

#include "domain/entities/Calendar.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

namespace application {

/// Carga la lista persistida y devuelve el calendario del mes con celdas pobladas.
[[nodiscard]] inline domain::Calendar calendarForMonth(domain::ITaskListRepository& repo,
                                                       const std::string& monthYear) {
    const domain::TaskList list = repo.load();
    domain::Calendar cal(monthYear);
    cal.buildCells();
    cal.populateFromTaskList(list);
    return cal;
}

} // namespace application
