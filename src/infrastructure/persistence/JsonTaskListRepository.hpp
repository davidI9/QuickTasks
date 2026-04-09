#pragma once

#include "domain/repositories/ITaskListRepository.hpp"

#include <filesystem>

/// Implementación JSON en `tasks.json` bajo un directorio de datos configurable.
class JsonTaskListRepository final : public domain::ITaskListRepository {
public:
    /// Usa `$HOME/.local/share/task-calendar` (requiere `HOME` definido).
    JsonTaskListRepository();

    /// `dataDirectory` es la carpeta que contiene `tasks.json` (p. ej. tests temporales).
    explicit JsonTaskListRepository(std::filesystem::path dataDirectory);

    [[nodiscard]] domain::TaskList load() override;
    void save(const domain::TaskList& list) override;
    void addTask(const domain::Task& task) override;
    void removeTask(const domain::TaskId& id) override;
    void updateTask(const domain::Task& task) override;

    [[nodiscard]] const std::filesystem::path& dataDirectory() const noexcept { return data_dir_; }

private:
    [[nodiscard]] std::filesystem::path tasksFilePath() const { return data_dir_ / "tasks.json"; }

    void ensureDataTreeAndEmptyTaskFile() const;

    std::filesystem::path data_dir_;
};
