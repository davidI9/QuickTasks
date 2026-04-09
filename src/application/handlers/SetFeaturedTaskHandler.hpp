#pragma once

#include "application/commands/SetFeaturedTaskCommand.hpp"
#include "domain/repositories/IFeaturedTaskRepository.hpp"

namespace application {

class SetFeaturedTaskHandler {
public:
    explicit SetFeaturedTaskHandler(domain::IFeaturedTaskRepository& featuredTaskRepository);

    void handle(const commands::SetFeaturedTaskCommand& cmd);

private:
    domain::IFeaturedTaskRepository& featured_;
};

} // namespace application
