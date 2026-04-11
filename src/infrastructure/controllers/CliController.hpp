#pragma once

#include <string>
#include <vector>

namespace infrastructure {

class CliController {
public:
    CliController() = default;

    int run(int argc, char* argv[]);
};

} // namespace infrastructure