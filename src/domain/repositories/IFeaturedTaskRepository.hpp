#pragma once

#include "domain/value_objects/TaskId.hpp"

#include <optional>

namespace domain {

/// Puerto de persistencia del uuid de tarea destacada.
class IFeaturedTaskRepository {
public:
    virtual ~IFeaturedTaskRepository() = default;

    /// Ausencia de valor en disco → `std::nullopt` (equivalente a JSON null).
    [[nodiscard]] virtual std::optional<TaskId> loadFeatured() = 0;

    /// Persiste el uuid destacado o, si `nullopt`, borra la selección (JSON null).
    virtual void saveFeatured(std::optional<TaskId> featuredId) = 0;
};

} // namespace domain
