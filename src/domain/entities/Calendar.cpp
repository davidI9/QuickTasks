#include "Calendar.hpp"

#include <chrono>
#include <stdexcept>
#include <tuple>

namespace domain {

namespace {

std::chrono::year_month_day todayYmd() {
    using namespace std::chrono;
    const auto today = floor<days>(std::chrono::system_clock::now());
    return year_month_day{today};
}

bool dateIsBefore(int y1, int m1, int d1, std::chrono::year_month_day today) {
    const int y = static_cast<int>(today.year());
    const int m = static_cast<int>(static_cast<unsigned>(today.month()));
    const int d = static_cast<int>(static_cast<unsigned>(today.day()));
    return std::tie(y1, m1, d1) < std::tie(y, m, d);
}

} // namespace

bool Calendar::isLeapYear(int y) noexcept {
    if (y % 4 != 0) {
        return false;
    }
    if (y % 100 != 0) {
        return true;
    }
    return (y % 400) == 0;
}

int Calendar::daysInMonth(int month, int year) noexcept {
    static constexpr int kDays[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (month == 2 && isLeapYear(year)) {
        return 29;
    }
    if (month >= 1 && month <= 12) {
        return kDays[month - 1];
    }
    return 0;
}

int Calendar::mondayZeroWeekdayFirstOfMonth(int y, int mon) {
    using namespace std::chrono;
    const year_month_day first{year{y} / month{static_cast<unsigned>(mon)} / day{1}};
    const weekday wd{sys_days{first}};
    const days diff = wd - Monday;
    const auto count = diff.count();
    if (count < 0 || count > 6) {
        throw std::logic_error("Calendar: weekday mapping out of range");
    }
    return static_cast<int>(count);
}

void Calendar::parseMonthYear(std::string_view text, int& outMonth, int& outYear) {
    if (text.size() != 7 || text[2] != '/') {
        throw std::invalid_argument("Calendar: monthYear must be mm/yyyy");
    }
    for (std::size_t i = 0; i < 7; ++i) {
        if (i == 2) {
            continue;
        }
        if (text[i] < '0' || text[i] > '9') {
            throw std::invalid_argument("Calendar: monthYear must be digits and slash");
        }
    }
    int m = (text[0] - '0') * 10 + (text[1] - '0');
    int y = (text[3] - '0') * 1000 + (text[4] - '0') * 100 + (text[5] - '0') * 10 + (text[6] - '0');
    if (m < 1 || m > 12) {
        throw std::invalid_argument("Calendar: month out of range");
    }
    outMonth = m;
    outYear = y;
}

Calendar::Calendar(std::string monthYear) : monthYear_(std::move(monthYear)) {
    parseMonthYear(monthYear_, month_, year_);
}

void Calendar::buildCells() {
    cells_.clear();
    const int firstDow = mondayZeroWeekdayFirstOfMonth(year_, month_);
    const int dim = daysInMonth(month_, year_);

    const int prevMonth = month_ == 1 ? 12 : month_ - 1;
    const int prevYear = month_ == 1 ? year_ - 1 : year_;
    const int dimPrev = daysInMonth(prevMonth, prevYear);

    const auto today = todayYmd();

    const int startPrevDay = dimPrev - firstDow + 1;
    for (int i = 0; i < firstDow; ++i) {
        const int d = startPrevDay + i;
        const bool past = dateIsBefore(prevYear, prevMonth, d, today);
        cells_.emplace_back(d, prevMonth, prevYear, false, past);
    }

    for (int d = 1; d <= dim; ++d) {
        const bool past = dateIsBefore(year_, month_, d, today);
        cells_.emplace_back(d, month_, year_, true, past);
    }

    int nextMonth = month_ == 12 ? 1 : month_ + 1;
    int nextYear = month_ == 12 ? year_ + 1 : year_;
    int nextDay = 1;

    const int needed = static_cast<int>(cells_.size());
    int weeks = (needed + 6) / 7;
    if (weeks < 5) {
        weeks = 5;
    }
    if (weeks > 6) {
        weeks = 6;
    }
    const int target = weeks * 7;

    while (static_cast<int>(cells_.size()) < target) {
        const bool past = dateIsBefore(nextYear, nextMonth, nextDay, today);
        cells_.emplace_back(nextDay, nextMonth, nextYear, false, past);
        ++nextDay;
        const int dimNext = daysInMonth(nextMonth, nextYear);
        if (nextDay > dimNext) {
            nextDay = 1;
            if (nextMonth == 12) {
                nextMonth = 1;
                ++nextYear;
            } else {
                ++nextMonth;
            }
        }
    }
}

void Calendar::populateFromTaskList(const TaskList& list) {
    for (auto& cell : cells_) {
        cell.tasks().clear();
    }

    list.forEachTaskWhile([this](const Task& task) -> bool {
        const auto& due = task.dueDate();
        const int ty = due.year();
        const int tm = due.month();

        if (ty < year_ || (ty == year_ && tm < month_)) {
            return true;
        }
        if (ty > year_ || (ty == year_ && tm > month_)) {
            return false;
        }

        const int dd = due.day();
        for (auto& cell : cells_) {
            if (cell.isCurrentMonth() && cell.day() == dd) {
                cell.tasks().push_back(task);
                break;
            }
        }
        return true;
    });
}

} // namespace domain
