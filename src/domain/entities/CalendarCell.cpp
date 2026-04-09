#include "CalendarCell.hpp"

namespace domain {

CalendarCell::CalendarCell(int day, int month, int year, bool isCurrentMonth, bool isPast)
    : day_(day)
    , month_(month)
    , year_(year)
    , isCurrentMonth_(isCurrentMonth)
    , isPast_(isPast) {}

} // namespace domain
