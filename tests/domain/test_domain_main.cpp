#include "domain/entities/Calendar.hpp"
#include "domain/entities/Task.hpp"
#include "domain/entities/TaskList.hpp"
#include "domain/value_objects/TaskCompleted.hpp"
#include "domain/value_objects/TaskDueDate.hpp"
#include "domain/value_objects/TaskId.hpp"
#include "domain/value_objects/TaskName.hpp"

#include <cassert>
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>

namespace {

using namespace domain;

void assertOrderedDates(const TaskList& list, const std::vector<std::string>& expectedDueDates) {
    std::vector<std::string> actual;
    list.forEachTask([&actual](const Task& t) { actual.push_back(t.dueDate().value()); });
    assert(actual.size() == expectedDueDates.size());
    for (std::size_t i = 0; i < actual.size(); ++i) {
        assert(actual[i] == expectedDueDates[i]);
    }
}

void testTaskListOrderedInsertAndRemove() {
    TaskList list;

    TaskId id1("aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee");
    TaskId id2("bbbbbbbb-cccc-4ddd-eeee-ffffffffffff");
    TaskId id3("cccccccc-dddd-4eee-ffff-000000000000");
    TaskId id4("dddddddd-eeee-4fff-0000-111111111111");

    list.insert(Task(id1, TaskName("a"), TaskDueDate("10/04/2026"), TaskCompleted{false}));
    list.insert(Task(id2, TaskName("b"), TaskDueDate("05/04/2026"), TaskCompleted{false}));
    assertOrderedDates(list, {"05/04/2026", "10/04/2026"});

    list.insert(Task(id3, TaskName("c"), TaskDueDate("05/04/2026"), TaskCompleted{false}));
    assertOrderedDates(list, {"05/04/2026", "05/04/2026", "10/04/2026"});

    list.insert(Task(id4, TaskName("d"), TaskDueDate("01/04/2026"), TaskCompleted{false}));
    assertOrderedDates(list, {"01/04/2026", "05/04/2026", "05/04/2026", "10/04/2026"});

    assert(list.remove(id2));
    assertOrderedDates(list, {"01/04/2026", "05/04/2026", "10/04/2026"});

    assert(list.remove(id1));
    assert(list.remove(id3));
    assert(list.remove(id4));
    assert(list.empty());
    assert(!list.head());
    assert(!list.tail());
}

void testCalendarApril2026BuildCells() {
    Calendar cal("04/2026");
    cal.buildCells();
    assert(cal.cells().size() == 35u);

    assert(cal.cells()[0].day() == 30);
    assert(cal.cells()[0].month() == 3);
    assert(cal.cells()[0].year() == 2026);
    assert(!cal.cells()[0].isCurrentMonth());

    assert(cal.cells()[1].day() == 31);
    assert(cal.cells()[1].month() == 3);

    assert(cal.cells()[2].day() == 1);
    assert(cal.cells()[2].month() == 4);
    assert(cal.cells()[2].isCurrentMonth());

    assert(cal.cells()[32].day() == 1);
    assert(cal.cells()[32].month() == 5);
    assert(!cal.cells()[32].isCurrentMonth());
}

void testPopulateFromTaskListStopsAfterMonth() {
    TaskList list;
    TaskId early("11111111-1111-4111-8111-111111111111");
    TaskId in1("22222222-2222-4222-8222-222222222222");
    TaskId in2("33333333-3333-4333-8333-333333333333");
    TaskId late("44444444-4444-4444-8444-444444444444");

    list.insert(Task(late, TaskName("late"), TaskDueDate("01/05/2026"), TaskCompleted{false}));
    list.insert(Task(in2, TaskName("d2"), TaskDueDate("15/04/2026"), TaskCompleted{false}));
    list.insert(Task(in1, TaskName("d1"), TaskDueDate("02/04/2026"), TaskCompleted{false}));
    list.insert(Task(early, TaskName("early"), TaskDueDate("31/03/2026"), TaskCompleted{false}));

    Calendar cal("04/2026");
    cal.buildCells();
    cal.populateFromTaskList(list);

    int tasksInApril = 0;
    for (const auto& cell : cal.cells()) {
        if (cell.isCurrentMonth()) {
            tasksInApril += static_cast<int>(cell.tasks().size());
        }
    }
    assert(tasksInApril == 2);

    bool found2 = false;
    bool found15 = false;
    for (const auto& cell : cal.cells()) {
        if (cell.isCurrentMonth() && cell.day() == 2 && cell.tasks().size() == 1u) {
            found2 = true;
            assert(cell.tasks()[0].name().value() == "d1");
        }
        if (cell.isCurrentMonth() && cell.day() == 15 && cell.tasks().size() == 1u) {
            found15 = true;
            assert(cell.tasks()[0].name().value() == "d2");
        }
    }
    assert(found2 && found15);
}

} // namespace

int main() {
    try {
        testTaskListOrderedInsertAndRemove();
        testCalendarApril2026BuildCells();
        testPopulateFromTaskListStopsAfterMonth();
    } catch (const std::exception& e) {
        std::cerr << "exception: " << e.what() << '\n';
        return 1;
    }
    std::cout << "domain_tests: ok\n";
    return 0;
}
