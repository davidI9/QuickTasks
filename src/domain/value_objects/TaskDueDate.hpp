#pragma once

#include <string>
#include <string_view>

namespace domain {

/// Calendar due date in dd/mm/yyyy; validates format and real calendar date (incl. leap years).
class TaskDueDate {
public:
    explicit TaskDueDate(std::string_view text);

    [[nodiscard]] const std::string& value() const noexcept { return value_; }

    [[nodiscard]] int day() const noexcept { return day_; }
    [[nodiscard]] int month() const noexcept { return month_; }
    [[nodiscard]] int year() const noexcept { return year_; }

    /// Zero-padded mm/yyyy for calendar matching.
    [[nodiscard]] std::string monthYearKey() const;

    [[nodiscard]] bool operator==(const TaskDueDate& o) const noexcept;
    [[nodiscard]] bool operator!=(const TaskDueDate& o) const noexcept { return !(*this == o); }
    [[nodiscard]] bool operator<(const TaskDueDate& o) const noexcept;

private:
    static bool isLeapYear(int y) noexcept;
    static int daysInMonth(int month, int year) noexcept;
    static void parseAndValidate(std::string_view text, int& outDay, int& outMonth, int& outYear);

    std::string value_;
    int day_{};
    int month_{};
    int year_{};
};

} // namespace domain
