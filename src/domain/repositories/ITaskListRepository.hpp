#pragma once

#include "domain/entities/Task.hpp"
#include "domain/entities/TaskList.hpp"
#include "domain/value_objects/TaskId.hpp"

namespace domain {

/// Puerto de persistencia para la lista de tareas (hexágono / DDD).
class ITaskListRepository {
public:
    virtual ~ITaskListRepository() = default;

    [[nodiscard]] virtual TaskList load() = 0;
    virtual void save(const TaskList& list) = 0;

    /// Carga, inserta en orden y persiste.
    virtual void addTask(const Task& task) = 0;

    /// Carga, elimina por uuid y persiste. Lanza si no existe la tarea.
    virtual void removeTask(const TaskId& id) = 0;

    /// Carga, sustituye la tarea con el mismo id y persiste. Lanza si no existe.
    virtual void updateTask(const Task& task) = 0;
};

} // namespace domain
