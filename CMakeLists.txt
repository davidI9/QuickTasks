cmake_minimum_required(VERSION 3.20)
project(task_calendar_backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(nlohmann_json 3.10.0 CONFIG QUIET)
if(NOT nlohmann_json_FOUND)
    include(FetchContent)
    FetchContent_Declare(
        nlohmann_json
        GIT_REPOSITORY https://github.com/nlohmann/json.git
        GIT_TAG v3.11.3
        GIT_SHALLOW TRUE
    )
    FetchContent_MakeAvailable(nlohmann_json)
endif()

add_library(task_calendar_domain
    src/domain/value_objects/TaskId.cpp
    src/domain/value_objects/TaskName.cpp
    src/domain/value_objects/TaskDueDate.cpp
    src/domain/entities/Task.cpp
    src/domain/entities/TaskList.cpp
    src/domain/entities/CalendarCell.cpp
    src/domain/entities/Calendar.cpp
    src/domain/entities/FeaturedTask.cpp
)

target_include_directories(task_calendar_domain PUBLIC
    "${CMAKE_CURRENT_SOURCE_DIR}/src"
)

target_compile_features(task_calendar_domain PUBLIC cxx_std_20)

add_library(task_calendar_persistence
    src/infrastructure/persistence/JsonTaskListRepository.cpp
    src/infrastructure/persistence/JsonFeaturedTaskRepository.cpp
)

target_include_directories(task_calendar_persistence PUBLIC
    "${CMAKE_CURRENT_SOURCE_DIR}/src"
)

target_link_libraries(task_calendar_persistence
    PUBLIC
        task_calendar_domain
        nlohmann_json::nlohmann_json
)

target_compile_features(task_calendar_persistence PUBLIC cxx_std_20)

add_library(task_calendar_application
    src/application/handlers/GetCalendarHandler.cpp
    src/application/handlers/AddTaskCalendarHandler.cpp
    src/application/handlers/RemoveTaskCalendarHandler.cpp
    src/application/handlers/EditTaskCalendarHandler.cpp
    src/application/handlers/GetTaskListHandler.cpp
    src/application/handlers/AddTaskBarHandler.cpp
    src/application/handlers/RemoveTaskBarHandler.cpp
    src/application/handlers/EditTaskBarHandler.cpp
    src/application/handlers/SetFeaturedTaskHandler.cpp
)

target_include_directories(task_calendar_application PUBLIC
    "${CMAKE_CURRENT_SOURCE_DIR}/src"
)

target_link_libraries(task_calendar_application PUBLIC task_calendar_domain)

target_compile_features(task_calendar_application PUBLIC cxx_std_20)

add_executable(domain_tests
    tests/domain/test_domain_main.cpp
)
target_link_libraries(domain_tests PRIVATE task_calendar_domain)
target_compile_features(domain_tests PRIVATE cxx_std_20)

add_executable(persistence_tests
    tests/persistence/test_persistence_main.cpp
)
target_link_libraries(persistence_tests PRIVATE task_calendar_persistence)
target_compile_features(persistence_tests PRIVATE cxx_std_20)

add_executable(application_tests
    tests/application/test_application_main.cpp
)
target_link_libraries(application_tests PRIVATE task_calendar_application)
target_compile_features(application_tests PRIVATE cxx_std_20)

add_executable(task-calendar
    main.cpp
    src/infrastructure/controllers/CliController.cpp
)
target_link_libraries(task-calendar PRIVATE task_calendar_application task_calendar_persistence)
target_compile_features(task-calendar PRIVATE cxx_std_20)
