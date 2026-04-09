#include "JsonFeaturedTaskRepository.hpp"

#include <cstdlib>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>

#include <nlohmann/json.hpp>

namespace fs = std::filesystem;

namespace {

[[nodiscard]] fs::path defaultDataDirectoryFromEnv() {
    const char* home = std::getenv("HOME");
    if (home == nullptr || home[0] == '\0') {
        throw std::runtime_error("JsonFeaturedTaskRepository: HOME is not set");
    }
    return fs::path(home) / ".local/share/task-calendar";
}

[[nodiscard]] bool isBlank(std::string_view s) noexcept {
    return s.find_first_not_of(" \t\n\r\f\v") == std::string_view::npos;
}

[[nodiscard]] std::string readEntireFile(const fs::path& path) {
    std::ifstream in(path, std::ios::binary);
    if (!in) {
        throw std::runtime_error("JsonFeaturedTaskRepository: cannot open file for read: " + path.string());
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
            throw std::runtime_error("JsonFeaturedTaskRepository: cannot open temp file for write: " + tmp.string());
        }
        out << utf8;
        if (!out.flush()) {
            throw std::runtime_error("JsonFeaturedTaskRepository: flush failed: " + tmp.string());
        }
    }
    std::error_code ec;
    fs::rename(tmp, finalPath, ec);
    if (ec) {
        fs::remove(tmp, ec);
        throw std::runtime_error("JsonFeaturedTaskRepository: rename failed for " + finalPath.string());
    }
}

[[nodiscard]] nlohmann::json parseFeaturedDocument(const std::string& content) {
    using nlohmann::json;
    if (content.empty() || isBlank(content)) {
        return json::object({{"featuredTaskId", nullptr}});
    }
    try {
        return json::parse(content);
    } catch (const nlohmann::json::parse_error& e) {
        throw std::runtime_error(std::string("featured.json: invalid JSON — ") + e.what());
    }
}

} // namespace

JsonFeaturedTaskRepository::JsonFeaturedTaskRepository() : data_dir_(defaultDataDirectoryFromEnv()) {}

JsonFeaturedTaskRepository::JsonFeaturedTaskRepository(fs::path dataDirectory) : data_dir_(std::move(dataDirectory)) {}

void JsonFeaturedTaskRepository::ensureDataTreeAndEmptyFeaturedFile() const {
    std::error_code ec;
    fs::create_directories(data_dir_, ec);
    if (ec) {
        throw std::runtime_error("JsonFeaturedTaskRepository: cannot create directory " + data_dir_.string() + ": " + ec.message());
    }

    const fs::path path = featuredFilePath();
    if (fs::exists(path)) {
        return;
    }

    const auto empty = nlohmann::json{{"featuredTaskId", nullptr}}.dump(2);
    writeAtomic(path, empty);
}

std::optional<domain::TaskId> JsonFeaturedTaskRepository::loadFeatured() {
    ensureDataTreeAndEmptyFeaturedFile();

    const fs::path path = featuredFilePath();
    const std::string raw = readEntireFile(path);
    nlohmann::json doc = parseFeaturedDocument(raw);

    if (!doc.is_object()) {
        throw std::runtime_error("featured.json: root must be an object");
    }

    if (!doc.contains("featuredTaskId") || doc["featuredTaskId"].is_null()) {
        return std::nullopt;
    }

    const auto& v = doc["featuredTaskId"];
    if (!v.is_string()) {
        throw std::runtime_error("featured.json: featuredTaskId must be a string or null");
    }

    try {
        return domain::TaskId(v.get_ref<const std::string&>());
    } catch (const std::invalid_argument& e) {
        throw std::runtime_error(std::string("featured.json: invalid uuid — ") + e.what());
    }
}

void JsonFeaturedTaskRepository::saveFeatured(std::optional<domain::TaskId> featuredId) {
    std::error_code ec;
    fs::create_directories(data_dir_, ec);
    if (ec) {
        throw std::runtime_error("JsonFeaturedTaskRepository: cannot create directory " + data_dir_.string() + ": " + ec.message());
    }

    nlohmann::json doc;
    if (featuredId) {
        doc["featuredTaskId"] = featuredId->value();
    } else {
        doc["featuredTaskId"] = nullptr;
    }

    writeAtomic(featuredFilePath(), doc.dump(2));
}
