#include "CliController.hpp"

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
#include "domain/entities/Calendar.hpp"
#include "domain/entities/TaskList.hpp"
#include "infrastructure/persistence/JsonFeaturedTaskRepository.hpp"
#include "infrastructure/persistence/JsonTaskListRepository.hpp"

#include <iostream>
#include <map>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>

#include <nlohmann/json.hpp>

namespace infrastructure {

namespace {

std::map<std::string, std::string> parseArgs(int argc, char* argv[]) {
    std::map<std::string, std::string> args;
    for (int i = 2; i < argc; ++i) {  // Start from argv[2], argv[1] is subcommand
        std::string arg = argv[i];
        if (arg.starts_with("--")) {
            std::string key = arg.substr(2);
            if (i + 1 < argc && !std::string(argv[i + 1]).starts_with("--")) {
                args[key] = argv[i + 1];
                ++i;
            } else {
                args[key] = "";  // Flag without value
            }
        }
    }
    return args;
}

nlohmann::json toJson(const domain::Calendar& cal, const std::optional<domain::TaskId>& featured) {
    nlohmann::json j;
    j["type"] = "calendar";
    j["monthYear"] = cal.monthYear();
    j["featuredTaskId"] = featured ? featured->value() : nullptr;
    j["cells"] = nlohmann::json::array();
    for (const auto& cell : cal.cells()) {
        nlohmann::json cellJ;
        cellJ["day"] = cell.day();
        cellJ["isCurrentMonth"] = cell.isCurrentMonth();
        cellJ["isPast"] = cell.isPast();
        cellJ["tasks"] = nlohmann::json::array();
        for (const auto& task : cell.tasks()) {
            nlohmann::json taskJ;
            taskJ["id"] = task.id().value();
            taskJ["name"] = task.name().value();
            taskJ["dueDate"] = task.dueDate().value();
            taskJ["completed"] = task.completed().value();
            taskJ["isFeatured"] = featured && featured->value() == task.id().value();
            cellJ["tasks"].push_back(taskJ);
        }
        j["cells"].push_back(cellJ);
    }
    return j;
}

nlohmann::json toJson(const domain::TaskList& list, const std::optional<domain::TaskId>& featured) {
    nlohmann::json j;
    j["type"] = "taskList";
    j["featuredTaskId"] = featured ? featured->value() : nullptr;
    j["tasks"] = nlohmann::json::array();
    list.forEachTask([&](const domain::Task& task) {
        nlohmann::json taskJ;
        taskJ["id"] = task.id().value();
        taskJ["name"] = task.name().value();
        taskJ["dueDate"] = task.dueDate().value();
        taskJ["completed"] = task.completed().value();
        taskJ["isFeatured"] = featured && featured->value() == task.id().value();
        j["tasks"].push_back(taskJ);
    });
    return j;
}

nlohmann::json successJson() {
    return {{"type", "success"}};
}

nlohmann::json errorJson(std::string code, std::string message) {
    return {
        {"type", "error"},
        {"code", std::move(code)},
        {"message", std::move(message)}
    };
}

} // namespace

int CliController::run(int argc, char* argv[]) {
    if (argc < 2) {
        std::cout << errorJson("INVALID_COMMAND", "Missing subcommand").dump() << std::endl;
        return 1;
    }

    std::string subcommand = argv[1];
    auto args = parseArgs(argc, argv);

    try {
        JsonTaskListRepository taskRepo;
        JsonFeaturedTaskRepository featuredRepo;
        auto featuredId = featuredRepo.loadFeatured();

        if (subcommand == "get-calendar") {
            if (args.find("month") == args.end()) {
                throw std::runtime_error("Missing required --month for get-calendar");
            }
            application::commands::GetCalendarCommand cmd{.monthYear = args["month"]};
            application::GetCalendarHandler handler(taskRepo);
            domain::Calendar cal = handler.handle(cmd);
            std::cout << toJson(cal, featuredId).dump() << std::endl;
        } else if (subcommand == "add-task") {
            if (args.find("name") == args.end() || args.find("due") == args.end()) {
                throw std::runtime_error("Missing required --name or --due for add-task");
            }
            std::string name = args["name"];
            std::string due = args["due"];
            if (args.find("month") != args.end()) {
                // Calendar mode
                application::commands::AddTaskCalendarCommand cmd{.name = name, .dueDate = due, .monthYear = args["month"]};
                application::AddTaskCalendarHandler handler(taskRepo);
                domain::Calendar cal = handler.handle(cmd);
                std::cout << toJson(cal, featuredId).dump() << std::endl;
            } else {
                // Bar mode
                application::commands::AddTaskBarCommand cmd{.name = name, .dueDate = due};
                application::AddTaskBarHandler handler(taskRepo);
                domain::TaskList list = handler.handle(cmd);
                std::cout << toJson(list, featuredId).dump() << std::endl;
            }
        } else if (subcommand == "remove-task") {
            if (args.find("id") == args.end()) {
                throw std::runtime_error("Missing required --id for remove-task");
            }
            std::string id = args["id"];
            if (args.find("month") != args.end()) {
                // Calendar mode
                application::commands::RemoveTaskCalendarCommand cmd{.taskUuid = id, .monthYear = args["month"]};
                application::RemoveTaskCalendarHandler handler(taskRepo);
                domain::Calendar cal = handler.handle(cmd);
                std::cout << toJson(cal, featuredId).dump() << std::endl;
            } else {
                // Bar mode
                application::commands::RemoveTaskBarCommand cmd{.taskUuid = id};
                application::RemoveTaskBarHandler handler(taskRepo);
                domain::TaskList list = handler.handle(cmd);
                std::cout << toJson(list, featuredId).dump() << std::endl;
            }
        } else if (subcommand == "edit-task") {
            if (args.find("id") == args.end()) {
                throw std::runtime_error("Missing required --id for edit-task");
            }
            std::string id = args["id"];
            std::optional<std::string> name = args.contains("name") ? std::make_optional(args.at("name")) : std::nullopt;
            std::optional<std::string> due = args.contains("due") ? std::make_optional(args.at("due")) : std::nullopt;
            std::optional<bool> completed = args.contains("completed") ? std::make_optional(args.at("completed") == "true") : std::nullopt;
            if (args.find("month") != args.end()) {
                // Calendar mode
                application::commands::EditTaskCalendarCommand cmd{
                    .taskUuid = id,
                    .newName = name,
                    .newDueDate = due,
                    .newCompleted = completed,
                    .monthYear = args["month"]
                };
                application::EditTaskCalendarHandler handler(taskRepo);
                domain::Calendar cal = handler.handle(cmd);
                std::cout << toJson(cal, featuredId).dump() << std::endl;
            } else {
                // Bar mode
                application::commands::EditTaskBarCommand cmd{
                    .taskUuid = id,
                    .newName = name,
                    .newDueDate = due,
                    .newCompleted = completed
                };
                application::EditTaskBarHandler handler(taskRepo);
                domain::TaskList list = handler.handle(cmd);
                std::cout << toJson(list, featuredId).dump() << std::endl;
            }
        } else if (subcommand == "get-tasks") {
            application::commands::GetTaskListCommand cmd;
            application::GetTaskListHandler handler(taskRepo);
            domain::TaskList list = handler.handle(cmd);
            std::cout << toJson(list, featuredId).dump() << std::endl;
        } else if (subcommand == "set-featured") {
            if (args.find("id") == args.end()) {
                throw std::runtime_error("Missing required --id for set-featured");
            }
            application::commands::SetFeaturedTaskCommand cmd{.taskUuid = args["id"]};
            application::SetFeaturedTaskHandler handler(taskRepo, featuredRepo);
            domain::TaskList list = handler.handle(cmd);
            std::cout << toJson(list, featuredRepo.loadFeatured()).dump() << std::endl;
        } else {
            throw std::runtime_error("Unknown subcommand: " + subcommand);
        }
    } catch (const std::exception& e) {
        std::cout << errorJson("COMMAND_ERROR", e.what()).dump() << std::endl;
        return 1;
    }

    return 0;
}

} // namespace infrastructure