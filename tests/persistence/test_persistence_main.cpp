#include "domain/entities/Task.hpp"
#include "domain/value_objects/TaskCompleted.hpp"
#include "domain/value_objects/TaskDueDate.hpp"
#include "domain/value_objects/TaskId.hpp"
#include "domain/value_objects/TaskName.hpp"
#include "infrastructure/persistence/JsonFeaturedTaskRepository.hpp"
#include "infrastructure/persistence/JsonTaskListRepository.hpp"

#include <cassert>
#include <cstdlib>
#include <ctime>
#include <filesystem>
#include <iostream>
#include <string>

namespace fs = std::filesystem;

namespace {

using namespace domain;

[[nodiscard]] fs::path makeTempDataDir() {
    const auto base = fs::temp_directory_path() / ("task_calendar_persist_test_" + std::to_string(std::rand()));
    fs::create_directories(base);
    return base;
}

void testTaskListRoundTripAndCrud() {
    const fs::path dir = makeTempDataDir();
    JsonTaskListRepository repo(dir);

    TaskList empty = repo.load();
    assert(empty.empty());

    TaskId id("aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee");
    Task t(id, TaskName("uno"), TaskDueDate("15/04/2026"), TaskCompleted{false});
    repo.addTask(t);

    TaskList one = repo.load();
    assert(!one.empty());
    Task* found = one.findByUuid(id);
    assert(found != nullptr);
    assert(found->name().value() == "uno");

    Task updated(id, TaskName("uno-edit"), TaskDueDate("20/04/2026"), TaskCompleted{true});
    repo.updateTask(updated);

    TaskList after = repo.load();
    Task* u = after.findByUuid(id);
    assert(u != nullptr);
    assert(u->name().value() == "uno-edit");
    assert(u->completed().value() == true);
    assert(u->dueDate().value() == "20/04/2026");

    repo.removeTask(id);
    assert(repo.load().empty());

    fs::remove_all(dir);
}

void testFeaturedRoundTrip() {
    const fs::path dir = makeTempDataDir();
    JsonFeaturedTaskRepository repo(dir);

    assert(!repo.loadFeatured().has_value());

    TaskId id("bbbbbbbb-cccc-4ddd-eeee-ffffffffffff");
    repo.saveFeatured(id);
    auto loaded = repo.loadFeatured();
    assert(loaded.has_value());
    assert(loaded->value() == id.value());

    repo.saveFeatured(std::nullopt);
    assert(!repo.loadFeatured().has_value());

    fs::remove_all(dir);
}

void testCreatesEmptyJsonWhenMissing() {
    const fs::path dir = makeTempDataDir();
    const fs::path tasks = dir / "tasks.json";
    const fs::path feat = dir / "featured.json";
    assert(!fs::exists(tasks));
    assert(!fs::exists(feat));

    JsonTaskListRepository tRepo(dir);
    (void)tRepo.load();
    assert(fs::exists(tasks));

    JsonFeaturedTaskRepository fRepo(dir);
    (void)fRepo.loadFeatured();
    assert(fs::exists(feat));

    fs::remove_all(dir);
}

} // namespace

int main() {
    std::srand(static_cast<unsigned>(std::time(nullptr)));
    try {
        testTaskListRoundTripAndCrud();
        testFeaturedRoundTrip();
        testCreatesEmptyJsonWhenMissing();
    } catch (const std::exception& e) {
        std::cerr << "exception: " << e.what() << '\n';
        return 1;
    }
    std::cout << "persistence_tests: ok\n";
    return 0;
}
