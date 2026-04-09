#pragma once

#include "domain/repositories/IFeaturedTaskRepository.hpp"

#include <filesystem>

class JsonFeaturedTaskRepository final : public domain::IFeaturedTaskRepository {
public:
    JsonFeaturedTaskRepository();
    explicit JsonFeaturedTaskRepository(std::filesystem::path dataDirectory);

    [[nodiscard]] std::optional<domain::TaskId> loadFeatured() override;
    void saveFeatured(std::optional<domain::TaskId> featuredId) override;

    [[nodiscard]] const std::filesystem::path& dataDirectory() const noexcept { return data_dir_; }

private:
    [[nodiscard]] std::filesystem::path featuredFilePath() const { return data_dir_ / "featured.json"; }

    void ensureDataTreeAndEmptyFeaturedFile() const;

    std::filesystem::path data_dir_;
};
