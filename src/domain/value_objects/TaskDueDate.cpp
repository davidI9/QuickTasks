#include "TaskDueDate.hpp"

#include <cstdio>
#include <stdexcept>
#include <tuple>

namespace domain {

bool TaskDueDate::isLeapYear(int y) noexcept {
    if (y % 4 != 0) {
        return false;
    }
    if (y % 100 != 0) {
        return true;
    }
    return (y % 400) == 0;
}

int TaskDueDate::daysInMonth(int month, int year) noexcept {
    static constexpr int kDays[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (month == 2 && isLeapYear(year)) {
        return 29;
    }
    if (month >= 1 && month <= 12) {
        return kDays[month - 1];
    }
    return 0;
}

void TaskDueDate::parseAndValidate(std::string_view text, int& outDay, int& outMonth, int& outYear) {
    if (text.size() != 10 || text[2] != '/' || text[5] != '/') {
        throw std::invalid_argument("TaskDueDate: expected dd/mm/yyyy");
    }
    for (std::size_t i = 0; i < 10; ++i) {
        if (i == 2 || i == 5) {
            continue;
        }
        if (text[i] < '0' || text[i] > '9') {
            throw std::invalid_argument("TaskDueDate: non-digit in date field");
        }
    }

    int d = 0;
    int m = 0;
    int y = 0;
    for (int i = 0; i < 2; ++i) {
        d = d * 10 + (text[static_cast<std::size_t>(i)] - '0');
    }
    for (int i = 3; i < 5; ++i) {
        m = m * 10 + (text[static_cast<std::size_t>(i)] - '0');
    }
    for (int i = 6; i < 10; ++i) {
        y = y * 10 + (text[static_cast<std::size_t>(i)] - '0');
    }

    if (m < 1 || m > 12) {
        throw std::invalid_argument("TaskDueDate: month out of range");
    }
    const int dim = daysInMonth(m, y);
    if (d < 1 || d > dim) {
        throw std::invalid_argument("TaskDueDate: day invalid for month/year");
    }

    outDay = d;
    outMonth = m;
    outYear = y;
}

TaskDueDate::TaskDueDate(std::string_view text) {
    parseAndValidate(text, day_, month_, year_);
    value_.assign(text.data(), text.size());
}

std::string TaskDueDate::monthYearKey() const {
    char buf[8];
    std::snprintf(buf, sizeof(buf), "%02d/%04d", month_, year_);
    return std::string(buf);
}

bool TaskDueDate::operator==(const TaskDueDate& o) const noexcept {
    return year_ == o.year_ && month_ == o.month_ && day_ == o.day_;
}

bool TaskDueDate::operator<(const TaskDueDate& o) const noexcept {
    return std::tie(year_, month_, day_) < std::tie(o.year_, o.month_, o.day_);
}

} // namespace domain
