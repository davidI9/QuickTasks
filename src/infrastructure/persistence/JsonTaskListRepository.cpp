#include "JsonTaskListRepository.hpp"

#include <cstdlib>
#include <fstream>
#include <iterator>
#include <sstream>
#include <stdexcept>
#include <string>

#include <nlohmann/json.hpp>

namespace fs = std::filesystem;

namespace {

[[nodiscard]] fs::path defaultDataDirectoryFromEnv() {
    const char* home = std::getenv("HOME");
    if (home == nullptr || home[0] == '\0') {
        throw std::runtime_error("JsonTaskListRepository: HOME is not set");
    }
    return fs::path(home) / ".local/share/task-calendar";
}

[[nodiscard]] bool isBlank(std::string_view s) noexcept {
    return s.find_first_not_of(" \t\n\r\f\v") == std::string_view::npos;
}

[[nodiscard]] std::string readEntireFile(const fs::path& path) {
    std::ifstream in(path, std::ios::binary);
    if (!in) {
        throw std::runtime_error("JsonTaskListRepository: cannot open file for read: " + path.string());
    }
    std::ostringstream oss;
    oss << in.rdbuf();
    return oss.str();
}

void writeAtomic(const fs::path& finalPath, const std::string& utf8) {
    const fs::path tmp = finalPath.string() + ".tmp";
    {
        std::ofstream out(tmp, std::ios::binary | std::ios::trunc);
        if (!out) {
            throw std::runtime_error("JsonTaskListRepository: cannot open temp file for write: " + tmp.string());
        }
        out << utf8;
        if (!out.flush()) {
            throw std::runtime_error("JsonTaskListRepository: flush failed: " + tmp.string());
        }
    }
    std::error_code ec;
    fs::rename(tmp, finalPath, ec);
    if (ec) {
        fs::remove(tmp, ec);
        throw std::runtime_error("JsonTaskListRepository: rename failed for " + finalPath.string());
    }
}

[[nodiscard]] nlohmann::json parseTasksDocument(const std::string& content) {
    using nlohmann::json;
    if (content.empty() || isBlank(content)) {
        return json::object({{"tasks", json::array()}});
    }
    try {
        return json::parse(content);
    } catch (const nlohmann::json::parse_error& e) {
        throw std::runtime_error(std::string("tasks.json: invalid JSON — ") + e.what());
    }
}

[[nodiscard]] nlohmann::json taskToJson(const domain::Task& t) {
    return {
        {"id", t.id().value()},
        {"name", t.name().value()},
        {"dueDate", t.dueDate().value()},
        {"completed", t.completed().value()},
    };
}

[[nodiscard]] domain::Task jsonToTask(const nlohmann::json& j) {
    if (!j.is_object()) {
        throw std::runtime_error("tasks.json: task entry must be an object");
    }
    try {
        const std::string& id = j.at("id").get_ref<const std::string&>();
        const std::string name = j.at("name").get<std::string>();
        const std::string due = j.at("dueDate").get<std::string>();
        const bool done = j.at("completed").get<bool>();
        return domain::Task(
            domain::TaskId(id),
            domain::TaskName(name),
            domain::TaskDueDate(due),
            domain::TaskCompleted(done));
    } catch (const nlohmann::json::exception& e) {
        throw std::runtime_error(std::string("tasks.json: bad task shape — ") + e.what());
    } catch (const std::invalid_argument& e) {
        throw std::runtime_error(std::string("tasks.json: invalid task field — ") + e.what());
    }
}

[[nodiscard]] nlohmann::json listToJson(const domain::TaskList& list) {
    nlohmann::json arr = nlohmann::json::array();
    list.forEachTask([&arr](const domain::Task& t) { arr.push_back(taskToJson(t)); });
    return nlohmann::json{{"tasks", std::move(arr)}};
}

} // namespace

JsonTaskListRepository::JsonTaskListRepository() : data_dir_(defaultDataDirectoryFromEnv()) {}

JsonTaskListRepository::JsonTaskListRepository(fs::path dataDirectory) : data_dir_(std::move(dataDirectory)) {}

void JsonTaskListRepository::ensureDataTreeAndEmptyTaskFile() const {
    std::error_code ec;
    fs::create_directories(data_dir_, ec);
    if (ec) {
        throw std::runtime_error("JsonTaskListRepository: cannot create directory " + data_dir_.string() + ": " + ec.message());
    }

    const fs::path path = tasksFilePath();
    if (fs::exists(path)) {
        return;
    }

    const auto empty = nlohmann::json{{"tasks", nlohmann::json::array()}}.dump(2);
    writeAtomic(path, empty);
}

domain::TaskList JsonTaskListRepository::load() {
    ensureDataTreeAndEmptyTaskFile();

    const fs::path path = tasksFilePath();
    const std::string raw = readEntireFile(path);
    nlohmann::json doc = parseTasksDocument(raw);

    if (!doc.is_object()) {
        throw std::runtime_error("tasks.json: root must be an object");
    }

    nlohmann::json tasks = doc.contains("tasks") ? doc["tasks"] : nlohmann::json::array();
    if (!tasks.is_array()) {
        throw std::runtime_error("tasks.json: \"tasks\" must be an array");
    }

    domain::TaskList list;
    for (const auto& item : tasks) {
        list.insert(jsonToTask(item));
    }
    return list;
}

void JsonTaskListRepository::save(const domain::TaskList& list) {
    std::error_code ec;
    fs::create_directories(data_dir_, ec);
    if (ec) {
        throw std::runtime_error("JsonTaskListRepository: cannot create directory " + data_dir_.string() + ": " + ec.message());
    }

    const nlohmann::json doc = listToJson(list);
    writeAtomic(tasksFilePath(), doc.dump(2));
}

void JsonTaskListRepository::addTask(const domain::Task& task) {
    domain::TaskList list = load();
    list.insert(task);
    save(list);
}

void JsonTaskListRepository::removeTask(const domain::TaskId& id) {
    domain::TaskList list = load();
    if (!list.remove(id)) {
        throw std::runtime_error("JsonTaskListRepository::removeTask: task not found");
    }
    save(list);
}

void JsonTaskListRepository::updateTask(const domain::Task& task) {
    domain::TaskList list = load();
    if (!list.remove(task.id())) {
        throw std::runtime_error("JsonTaskListRepository::updateTask: task not found");
    }
    list.insert(task);
    save(list);
}
