#pragma once

#include "CalendarCell.hpp"
#include "TaskList.hpp"

#include <string>
#include <vector>

namespace domain {

class Calendar {
public:
    explicit Calendar(std::string monthYear);

    [[nodiscard]] const std::string& monthYear() const noexcept { return monthYear_; }
    [[nodiscard]] const std::vector<CalendarCell>& cells() const noexcept { return cells_; }
    [[nodiscard]] std::vector<CalendarCell>& cells() noexcept { return cells_; }

    void buildCells();
    void populateFromTaskList(const TaskList& list);

private:
    static int daysInMonth(int month, int year) noexcept;
    static bool isLeapYear(int y) noexcept;
    static int mondayZeroWeekdayFirstOfMonth(int year, int month) noexcept;
    static void parseMonthYear(std::string_view text, int& outMonth, int& outYear);

    std::string monthYear_;
    int month_{};
    int year_{};
    std::vector<CalendarCell> cells_;
};

} // namespace domain
