#include "infrastructure/controllers/CliController.hpp"

int main(int argc, char* argv[]) {
    infrastructure::CliController controller;
    return controller.run(argc, argv);
}