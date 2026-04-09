#include "TaskId.hpp"

#include <array>
#include <cctype>
#include <cstdio>
#include <random>
#include <stdexcept>

namespace domain {

namespace {

bool isHex(char c) {
    return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}

unsigned hexVal(char c) {
    if (c >= '0' && c <= '9') return static_cast<unsigned>(c - '0');
    if (c >= 'a' && c <= 'f') return 10u + static_cast<unsigned>(c - 'a');
    if (c >= 'A' && c <= 'F') return 10u + static_cast<unsigned>(c - 'A');
    return 0;
}

} // namespace

std::string TaskId::generateUuidV4() {
    thread_local std::mt19937 rng{std::random_device{}()};
    std::uniform_int_distribution<unsigned> dist(0, 255);

    std::array<unsigned char, 16> bytes{};
    for (auto& b : bytes) {
        b = static_cast<unsigned char>(dist(rng));
    }
    bytes[6] = static_cast<unsigned char>((bytes[6] & 0x0Fu) | 0x40u);
    bytes[8] = static_cast<unsigned char>((bytes[8] & 0x3Fu) | 0x80u);

    char buf[37];
    std::snprintf(buf, sizeof(buf),
                  "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
                  bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
                  bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14],
                  bytes[15]);
    return std::string(buf);
}

TaskId::TaskId() : value_(generateUuidV4()) {}

TaskId::TaskId(std::string_view uuid) {
    if (uuid.size() != 36) {
        throw std::invalid_argument("TaskId: UUID must be 36 characters (8-4-4-4-12)");
    }
    for (std::size_t i = 0; i < 36; ++i) {
        const char c = uuid[i];
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            if (c != '-') {
                throw std::invalid_argument("TaskId: invalid UUID hyphen placement");
            }
        } else if (!isHex(c)) {
            throw std::invalid_argument("TaskId: UUID must be hexadecimal in digit positions");
        }
    }
    std::string normalized;
    normalized.reserve(36);
    for (char c : uuid) {
        normalized.push_back(static_cast<char>(std::tolower(static_cast<unsigned char>(c))));
    }
    value_ = std::move(normalized);
}

} // namespace domain
