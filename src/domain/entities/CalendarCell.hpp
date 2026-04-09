#pragma once

#include "Task.hpp"

#include <vector>

namespace domain {

/// One cell in the month grid: a calendar day, flags, and tasks due that day.
class CalendarCell {
public:
    CalendarCell(int day, int month, int year, bool isCurrentMonth, bool isPast);

    [[nodiscard]] int day() const noexcept { return day_; }
    [[nodiscard]] int month() const noexcept { return month_; }
    [[nodiscard]] int year() const noexcept { return year_; }

    [[nodiscard]] bool isCurrentMonth() const noexcept { return isCurrentMonth_; }
    [[nodiscard]] bool isPast() const noexcept { return isPast_; }

    [[nodiscard]] std::vector<Task>& tasks() noexcept { return tasks_; }
    [[nodiscard]] const std::vector<Task>& tasks() const noexcept { return tasks_; }

private:
    int day_{};
    int month_{};
    int year_{};
    bool isCurrentMonth_{};
    bool isPast_{};
    std::vector<Task> tasks_;
};

} // namespace domain
