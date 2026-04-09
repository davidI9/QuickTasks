# task-calendar-backend — build y tests (CMake)
# Añade aquí nuevos targets `test-*` conforme incorpores suites (persistencia, CLI, etc.).

CMAKE ?= cmake
BUILD_DIR ?= build
JOBS ?= $(shell nproc 2>/dev/null || echo 4)

# Directorio opcional para builds con sanitizers (no versionado)
BUILD_ASAN_DIR ?= build-asan

CMAKE_DEPS := CMakeLists.txt

.PHONY: all help configure build rebuild test test-domain test-persistence test-application test-asan clean clean-asan clean-all distclean

help:
	@echo "Comandos principales:"
	@echo "  make configure   — fuerza CMake configure en $(BUILD_DIR)"
	@echo "  make build       — configure si falta o CMakeLists.txt cambió, luego compila"
	@echo "  make rebuild     — distclean + configure + build"
	@echo "  make test                — global: domain + persistence + application + asan (+ más)"
	@echo "  make test-domain         — solo dominio: $(BUILD_DIR)/domain_tests"
	@echo "  make test-persistence    — solo JSON/repos: $(BUILD_DIR)/persistence_tests"
	@echo "  make test-application    — solo handlers/commands: $(BUILD_DIR)/application_tests"
	@echo "  make test-asan           — solo ASan/UBSan: build en $(BUILD_ASAN_DIR) + domain_tests"
	@echo "  make clean       — borra solo $(BUILD_DIR)"
	@echo "  make clean-asan  — borra solo $(BUILD_ASAN_DIR)"
	@echo "  make clean-all   — borra $(BUILD_DIR) y $(BUILD_ASAN_DIR)"
	@echo "  make distclean   — igual que clean-all (compatibilidad)"
	@echo ""
	@echo "Variables: BUILD_DIR, JOBS (p. ej. make build JOBS=8)"

all: build

configure:
	$(CMAKE) -S . -B $(BUILD_DIR)

$(BUILD_DIR)/CMakeCache.txt: $(CMAKE_DEPS)
	$(CMAKE) -S . -B $(BUILD_DIR)

build: $(BUILD_DIR)/CMakeCache.txt
	$(CMAKE) --build $(BUILD_DIR) -j $(JOBS)

# --- Tests ---
# test-domain / test-asan: una suite cada uno.
# test (global): depende de cada suite; al añadir p. ej. persistence_tests:
#   1) target test-persistence (ejecutable en $(BUILD_DIR) o ruta que toque)
#   2) añade test-persistence a .PHONY y a la línea "test: ..."
#   3) documenta en help

test-domain: build
	@echo "== domain_tests =="
	@$(BUILD_DIR)/domain_tests

test-persistence: build
	@echo "== persistence_tests =="
	@$(BUILD_DIR)/persistence_tests

test-application: build
	@echo "== application_tests =="
	@$(BUILD_DIR)/application_tests

test: test-domain test-persistence test-application test-asan

test-asan:
	$(CMAKE) -S . -B $(BUILD_ASAN_DIR) \
		-DCMAKE_CXX_FLAGS="-fsanitize=address,undefined -g" \
		-DCMAKE_EXE_LINKER_FLAGS="-fsanitize=address,undefined"
	$(CMAKE) --build $(BUILD_ASAN_DIR) -j $(JOBS)
	@echo "== domain_tests (ASan/UBSan) =="
	@$(BUILD_ASAN_DIR)/domain_tests

rebuild: distclean
	@$(MAKE) build

clean:
	rm -rf $(BUILD_DIR)

clean-asan:
	rm -rf $(BUILD_ASAN_DIR)

clean-all: clean clean-asan

distclean: clean-all
