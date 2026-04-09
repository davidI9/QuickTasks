#include "application/commands/AddTaskBarCommand.hpp"
#include "application/commands/AddTaskCalendarCommand.hpp"
#include "application/commands/EditTaskBarCommand.hpp"
#include "application/commands/EditTaskCalendarCommand.hpp"
#include "application/commands/GetCalendarCommand.hpp"
#include "application/commands/GetTaskListCommand.hpp"
#include "application/commands/RemoveTaskBarCommand.hpp"
#include "application/commands/RemoveTaskCalendarCommand.hpp"
#include "application/commands/SetFeaturedTaskCommand.hpp"
#include "application/handlers/AddTaskBarHandler.hpp"
#include "application/handlers/AddTaskCalendarHandler.hpp"
#include "application/handlers/EditTaskBarHandler.hpp"
#include "application/handlers/EditTaskCalendarHandler.hpp"
#include "application/handlers/GetCalendarHandler.hpp"
#include "application/handlers/GetTaskListHandler.hpp"
#include "application/handlers/RemoveTaskBarHandler.hpp"
#include "application/handlers/RemoveTaskCalendarHandler.hpp"
#include "application/handlers/SetFeaturedTaskHandler.hpp"
#include "domain/repositories/IFeaturedTaskRepository.hpp"
#include "domain/repositories/ITaskListRepository.hpp"

#include <cassert>
#include <iostream>
#include <stdexcept>

namespace {

using namespace application::commands;
using namespace application;
using namespace domain;

/// Repositorio en memoria para tests (misma semántica que persistencia sin I/O).
class InMemoryTaskListRepository final : public ITaskListRepository {
public:
    [[nodiscard]] TaskList load() override { return list_; }

    void save(const TaskList& list) override { list_ = list; }

    void addTask(const Task& task) override { list_.insert(task); }

    void removeTask(const TaskId& id) override {
        if (!list_.remove(id)) {
            throw std::runtime_error("InMemoryTaskListRepository: task not found");
        }
    }

    void updateTask(const Task& task) override {
        if (!list_.remove(task.id())) {
            throw std::runtime_error("InMemoryTaskListRepository: task not found");
        }
        list_.insert(task);
    }

private:
    TaskList list_;
};

class InMemoryFeaturedTaskRepository final : public IFeaturedTaskRepository {
public:
    [[nodiscard]] std::optional<TaskId> loadFeatured() override { return featured_; }

    void saveFeatured(std::optional<TaskId> featuredId) override { featured_ = std::move(featuredId); }

private:
    std::optional<TaskId> featured_;
};

void testGetCalendarEmpty() {
    InMemoryTaskListRepository tasks;
    GetCalendarHandler handler(tasks);
    const GetCalendarCommand cmd{.monthYear = "04/2026"};
    const Calendar cal = handler.handle(cmd);
    assert(cal.monthYear() == "04/2026");
    assert(!cal.cells().empty());
}

void testAddTaskCalendarPopulatesCell() {
    InMemoryTaskListRepository tasks;
    AddTaskCalendarHandler addHandler(tasks);
    AddTaskCalendarCommand addCmd{.name = "T1", .dueDate = "10/04/2026", .monthYear = "04/2026"};
    const Calendar afterAdd = addHandler.handle(addCmd);

    bool found = false;
    for (const auto& cell : afterAdd.cells()) {
        if (cell.isCurrentMonth() && cell.day() == 10 && !cell.tasks().empty()) {
            assert(cell.tasks()[0].name().value() == "T1");
            found = true;
        }
    }
    assert(found);
}

void testRemoveAndEditCalendar() {
    InMemoryTaskListRepository tasks;
    const TaskId id("aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee");
    tasks.addTask(Task(id, TaskName("x"), TaskDueDate("05/04/2026"), TaskCompleted{false}));

    RemoveTaskCalendarHandler removeHandler(tasks);
    RemoveTaskCalendarCommand rem{.taskUuid = id.value(), .monthYear = "04/2026"};
    (void)removeHandler.handle(rem);

    tasks.addTask(Task(id, TaskName("y"), TaskDueDate("03/04/2026"), TaskCompleted{false}));
    EditTaskCalendarHandler editHandler(tasks);
    EditTaskCalendarCommand edit{
        .taskUuid = id.value(),
        .newName = "z",
        .newDueDate = "04/04/2026",
        .newCompleted = true,
        .monthYear = "04/2026",
    };
    const Calendar edited = editHandler.handle(edit);

    bool saw = false;
    for (const auto& cell : edited.cells()) {
        if (cell.isCurrentMonth() && cell.day() == 4 && !cell.tasks().empty()) {
            assert(cell.tasks()[0].name().value() == "z");
            assert(cell.tasks()[0].completed().value() == true);
            assert(cell.tasks()[0].id() == id);
            saw = true;
        }
    }
    assert(saw);
}

void testGetTaskListAndBarCrud() {
    InMemoryTaskListRepository tasks;
    GetTaskListHandler getList(tasks);
    assert(getList.handle(GetTaskListCommand{}).empty());

    AddTaskBarHandler addBar(tasks);
    const TaskList afterAdd = addBar.handle(AddTaskBarCommand{.name = "bar", .dueDate = "01/05/2026"});
    assert(!afterAdd.empty());

    TaskId id;
    afterAdd.forEachTask([&id](const Task& x) { id = x.id(); });

    EditTaskBarHandler editBar(tasks);
    TaskList afterEdit = editBar.handle(EditTaskBarCommand{
        .taskUuid = id.value(),
        .newName = "bar2",
        .newDueDate = "02/05/2026",
        .newCompleted = true,
    });
    Task* t = afterEdit.findByUuid(id);
    assert(t != nullptr);
    assert(t->name().value() == "bar2");

    RemoveTaskBarHandler remBar(tasks);
    const TaskList afterRem = remBar.handle(RemoveTaskBarCommand{.taskUuid = id.value()});
    assert(afterRem.empty());
}

void testSetFeatured() {
    InMemoryFeaturedTaskRepository featured;
    SetFeaturedTaskHandler handler(featured);
    assert(!featured.loadFeatured().has_value());

    const TaskId id("bbbbbbbb-cccc-4ddd-eeee-ffffffffffff");
    handler.handle(SetFeaturedTaskCommand{.taskUuid = id.value()});
    assert(featured.loadFeatured().has_value());
    assert(featured.loadFeatured()->value() == id.value());
}

} // namespace

int main() {
    try {
        testGetCalendarEmpty();
        testAddTaskCalendarPopulatesCell();
        testRemoveAndEditCalendar();
        testGetTaskListAndBarCrud();
        testSetFeatured();
    } catch (const std::exception& e) {
        std::cerr << "exception: " << e.what() << '\n';
        return 1;
    }
    std::cout << "application_tests: ok\n";
    return 0;
}
