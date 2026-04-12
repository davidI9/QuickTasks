# ARCHITECTURE.md — Task Calendar Widget: Master Design Document

---

## 1. Visión General

Widget de escritorio para Hyprland (Wayland) que combina un calendario interactivo de tareas con una barra compacta de tarea activa. El sistema opera en dos modos visuales mutuamente excluyentes:

- **Modo Calendario:** Cuadrícula mensual navegable, con días, tareas por día, navegación por meses y gestión completa de tareas (crear, eliminar, marcar, destacar).
- **Modo Barra:** Tira horizontal minimalista que muestra únicamente la tarea destacada (activa), con navegación entre tareas por fecha, marcado de completado y texto animado si desborda.

El estado persiste en disco a través del backend C++. El frontend AGS consulta y muta el estado ejecutando comandos CLI del backend e interpretando sus salidas JSON por `stdout`.

### Flujos Principales

```
[Usuario ejecuta comando spawn] → AGS se renderiza en modo Calendario
[Usuario ejecuta comando toggle-mode] → AGS alterna entre modo Calendario y modo Barra
[AGS necesita datos] → Ejecuta CLI del backend → Lee JSON de stdout → Actualiza estado interno
[AGS muta datos] → Ejecuta CLI del backend con argumentos → Backend persiste → Devuelve JSON actualizado
```

---

## 2. Stack Tecnológico

### Backend: C++20 + CLI

**Justificación:**
- La lógica de dominio (lista doblemente enlazada ordenada por fecha, entidades, value objects con validación) requiere control de memoria y tipado fuerte que C++20 provee limpiamente.
- El backend se expone como binario CLI invocable desde cualquier entorno sin dependencias de runtime.
- La serialización de salida con `nlohmann/json` garantiza un contrato de datos estable y legible para el frontend.
- La persistencia local (archivo JSON plano) es suficiente para el volumen de datos esperado y permite lectura/escritura atómica.

### Frontend: AGS (TypeScript + GTK3 + CSS)

**Justificación:**
- AGS es el framework estándar para widgets en Hyprland/Wayland, soporta spawn/overlay nativo como ventanas GTK Layer Shell.
- TypeScript permite tipado del contrato JSON recibido del backend.
- CSS de GTK3 permite animaciones, hovers y tematización dinámica desde caché de colores externa.
- AGS puede ejecutar subprocesos y leer su `stdout`, eliminando la necesidad de middleware HTTP.

### Comunicación: JSON por stdout

El frontend ejecuta el binario del backend con los argumentos del caso de uso. El backend imprime en `stdout` un JSON con el resultado y termina. AGS parsea el JSON y actualiza su estado reactivo interno. No existe servidor permanente, socket ni HTTP.

---

## 3. Estructura de Directorios del Backend

```
task-calendar-backend/
├── CMakeLists.txt
├── vcpkg.json                          # Dependencia: nlohmann/json, uuid (o stduuid)
├── main.cpp                            # Entry point CLI: parsea argv y despacha al controlador
│
└── src/
    │
    ├── domain/
    │   │
    │   ├── value_objects/
    │   │   ├── TaskId.hpp              # Wrapper UUID: solo getter, inmutable, se genera en construcción
    │   │   ├── TaskName.hpp            # Cadena max 60 chars: valida longitud en constructor
    │   │   ├── TaskDueDate.hpp         # Cadena dd/mm/yyyy: valida formato y fecha real en constructor
    │   │   └── TaskCompleted.hpp       # Wrapper bool: valida que sea bool en construcción
    │   │
    │   ├── entities/
    │   │   ├── Task.hpp                # Entidad Tarea: agrega los 4 value objects
    │   │   ├── Task.cpp
    │   │   ├── TaskNode.hpp            # Nodo de lista doblemente enlazada: contiene Task, punteros prev/next
    │   │   ├── TaskList.hpp            # Lista doblemente enlazada ordenada por fecha
    │   │   ├── TaskList.cpp            # Métodos: insert (ordenado), remove (por uuid), findByUuid, getters/setters por uuid
    │   │   ├── CalendarCell.hpp        # Casilla del calendario: número de día, mes/año de referencia, bandera de mes actual, lista de Tasks del día
    │   │   ├── CalendarCell.cpp
    │   │   ├── Calendar.hpp            # Entidad Calendario: campo mm/yyyy, vector de CalendarCell
    │   │   ├── Calendar.cpp            # Métodos: buildCells(), populateFromTaskList(TaskList&)
    │   │   ├── FeaturedTask.hpp        # Entidad tarea destacada: almacena un TaskId (uuid), singleton o inyectable
    │   │   └── FeaturedTask.cpp
    │   │
    │   └── repositories/
    │       ├── ITaskListRepository.hpp # Interfaz abstracta pura del repositorio de tareas
    │       │                           # Métodos abstractos:
    │       │                           #   - TaskList load()
    │       │                           #   - void save(const TaskList&)
    │       │                           #   - void addTask(const Task&)       [carga, inserta, persiste]
    │       │                           #   - void removeTask(const TaskId&)  [carga, elimina, persiste]
    │       │                           #   - void updateTask(const Task&)    [carga, modifica, persiste]
    │       └── IFeaturedTaskRepository.hpp # Interfaz abstracta para persistir el uuid de tarea destacada
    │                                       # Métodos: TaskId loadFeatured(), void saveFeatured(const TaskId&)
    │
    ├── application/
    │   │
    │   ├── commands/
    │   │   ├── GetCalendarCommand.hpp      # Campos: string monthYear (mm/yyyy)
    │   │   ├── AddTaskCalendarCommand.hpp  # Campos: string name, string dueDate, string monthYear
    │   │   ├── RemoveTaskCalendarCommand.hpp # Campos: string taskUuid, string monthYear
    │   │   ├── EditTaskCalendarCommand.hpp # Campos: string taskUuid, string newName, string newDueDate, bool newCompleted, string monthYear
    │   │   ├── GetTaskListCommand.hpp      # Sin campos (obtiene lista completa para modo barra)
    │   │   ├── AddTaskBarCommand.hpp       # Campos: string name, string dueDate
    │   │   ├── RemoveTaskBarCommand.hpp    # Campos: string taskUuid
    │   │   ├── EditTaskBarCommand.hpp      # Campos: string taskUuid, string newName, string newDueDate, bool newCompleted
    │   │   └── SetFeaturedTaskCommand.hpp  # Campos: string taskUuid
    │   │
    │   └── handlers/
    │       ├── GetCalendarHandler.hpp      # Recibe ITaskListRepository&; handle(GetCalendarCommand) → devuelve Calendar serializado
    │       ├── GetCalendarHandler.cpp
    │       ├── AddTaskCalendarHandler.hpp  # Recibe ITaskListRepository&; handle(AddTaskCalendarCommand) → devuelve Calendar actualizado
    │       ├── AddTaskCalendarHandler.cpp
    │       ├── RemoveTaskCalendarHandler.hpp
    │       ├── RemoveTaskCalendarHandler.cpp
    │       ├── EditTaskCalendarHandler.hpp
    │       ├── EditTaskCalendarHandler.cpp
    │       ├── GetTaskListHandler.hpp      # Recibe ITaskListRepository&; handle(GetTaskListCommand) → devuelve TaskList serializada
    │       ├── GetTaskListHandler.cpp
    │       ├── AddTaskBarHandler.hpp
    │       ├── AddTaskBarHandler.cpp
    │       ├── RemoveTaskBarHandler.hpp
    │       ├── RemoveTaskBarHandler.cpp
    │       ├── EditTaskBarHandler.hpp
    │       ├── EditTaskBarHandler.cpp
    │       ├── SetFeaturedTaskHandler.hpp  # Recibe IFeaturedTaskRepository&; handle(SetFeaturedTaskCommand) → persiste uuid destacado
    │       └── SetFeaturedTaskHandler.cpp
    │
    └── infrastructure/
        │
        ├── controllers/
        │   └── CliController.hpp       # Parsea argv del main, construye el Command correcto,
        │   └── CliController.cpp       # instancia el repositorio concreto, instancia el Handler,
        │                               # invoca handle(), serializa resultado a JSON, imprime en stdout
        │
        └── persistence/
            ├── JsonTaskListRepository.hpp   # Implementa ITaskListRepository
            ├── JsonTaskListRepository.cpp   # Lee/escribe ~/.local/share/task-calendar/tasks.json
            ├── JsonFeaturedTaskRepository.hpp  # Implementa IFeaturedTaskRepository
            └── JsonFeaturedTaskRepository.cpp  # Lee/escribe ~/.local/share/task-calendar/featured.json
```

### Lógica de Negocio Crítica a Implementar en Entidades

#### TaskList (lista doblemente enlazada)

- **insert(Task):** Recorre desde head comparando `TaskDueDate`. Si fecha nueva < fecha nodo actual → inserta antes del nodo actual. Si fecha nueva == fecha nodo actual → inserta antes del nodo actual. Si fecha nueva > fecha nodo actual → avanza. Si llega a tail sin insertar → inserta al final. Si lista vacía → el nodo es head y tail. Si solo hay un nodo y se inserta otro → actualizar prev/next del nodo existente y del nuevo correctamente.
- **remove(TaskId):** Localiza nodo por uuid, reconecta prev→next y next→prev del entorno, libera nodo.
- **findByUuid(TaskId):** Recorre la lista comparando uuid, devuelve referencia a Task o null/opcional.
- **Getters/Setters delegados:** Reciben uuid + valor nuevo, localizan tarea, invocan setter de la entidad Task.

#### Calendar::buildCells()

- Parsea campo `mm/yyyy` para obtener mes y año numéricos.
- Calcula día de la semana del primer día del mes (0=Lunes … 6=Domingo).
- Calcula número de días del mes (considera años bisiestos para febrero).
- Genera vector de 35 o 42 `CalendarCell` (5 o 6 semanas según necesidad):
  - Celdas previas al día 1: días del mes anterior, marcadas con `isCurrentMonth=false`.
  - Celdas del mes actual: días 1…N, marcadas con `isCurrentMonth=true`.
  - Celdas posteriores al último día: días 1… del mes siguiente, marcadas con `isCurrentMonth=false`.

#### Calendar::populateFromTaskList(TaskList&)

- Recorre TaskList desde head.
- Por cada tarea extrae `dd` y `mm/yyyy` de su `TaskDueDate`.
- Si `mm/yyyy` de la tarea es menor al del calendario → continúa (aún no hemos llegado al mes).
- Si `mm/yyyy` de la tarea coincide con el del calendario → busca la CalendarCell con `day == dd` y añade la tarea a su lista interna.
- Si `mm/yyyy` de la tarea es mayor al del calendario → `break` (lista ordenada, no habrá más tareas del mes).

---

## 4. Contrato de Datos — JSON de Comunicación CLI → AGS

### 4.1 Respuesta: Calendario Completo

```json
{
  "type": "calendar",
  "monthYear": "04/2026",
  "featuredTaskId": "uuid-string-or-null",
  "cells": [
    {
      "day": 30,
      "isCurrentMonth": false,
      "isPast": false,
      "tasks": []
    },
    {
      "day": 31,
      "isCurrentMonth": false,
      "isPast": false,
      "tasks": []
    },
    {
      "day": 1,
      "isCurrentMonth": true,
      "isPast": false,
      "tasks": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Entregar informe",
          "dueDate": "01/04/2026",
          "completed": false,
          "isFeatured": true
        }
      ]
    }
  ]
}
```

### 4.2 Respuesta: Lista de Tareas (Modo Barra)

```json
{
  "type": "taskList",
  "featuredTaskId": "uuid-string-or-null",
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Entregar informe",
      "dueDate": "01/04/2026",
      "completed": false,
      "isFeatured": true
    },
    {
      "id": "660e9500-f30c-52e5-b827-557766551111",
      "name": "Revisar PR de backend",
      "dueDate": "03/04/2026",
      "completed": false,
      "isFeatured": false
    }
  ]
}
```

### 4.3 Respuesta: Error

```json
{
  "type": "error",
  "code": "TASK_NOT_FOUND",
  "message": "No task found with uuid 550e8400-e29b-41d4-a716-446655440000"
}
```

### 4.4 Comandos CLI → Argumentos

| Caso de Uso | Comando |
|---|---|
| Obtener calendario | `task-calendar get-calendar --month 04/2026` |
| Añadir tarea (calendario) | `task-calendar add-task --name "Texto" --due 01/04/2026 --month 04/2026` |
| Eliminar tarea (calendario) | `task-calendar remove-task --id <uuid> --month 04/2026` |
| Editar tarea (calendario) | `task-calendar edit-task --id <uuid> --name "Nuevo" --due 02/04/2026 --completed false --month 04/2026` |
| Obtener lista (barra) | `task-calendar get-tasks` |
| Añadir tarea (barra) | `task-calendar add-task --name "Texto" --due 01/04/2026` |
| Eliminar tarea (barra) | `task-calendar remove-task --id <uuid>` |
| Editar tarea (barra) | `task-calendar edit-task --id <uuid> --name "Nuevo" --due 02/04/2026 --completed true` |
| Marcar tarea destacada | `task-calendar set-featured --id <uuid>` |

---

## 5. Estructura del Frontend (AGS)

```
task-calendar-ags/
├── app.ts                      # Entry point AGS: registra ventanas, escucha señales de modo
├── style.css                   # Estilos globales GTK3: variables CSS, animaciones, temas
│
├── state/
│   ├── AppState.ts             # Estado global reactivo (Variable AGS):
│   │                           #   - mode: "calendar" | "bar"
│   │                           #   - currentMonthYear: string
│   │                           #   - calendarData: CalendarJSON | null
│   │                           #   - taskList: TaskJSON[] | null
│   │                           #   - featuredTaskId: string | null
│   │                           #   - barCurrentIndex: number (índice visible en barra)
│   └── ThemeState.ts           # Lee caché de caelestia-shell, expone paleta de colores como Variables CSS inyectadas dinámicamente
│
├── services/
│   ├── BackendService.ts       # Wrapper sobre Utils.execAsync de AGS:
│   │                           #   - getCalendar(monthYear): Promise<CalendarJSON>
│   │                           #   - addTask(name, dueDate, monthYear?): Promise<CalendarJSON | TaskListJSON>
│   │                           #   - removeTask(uuid, monthYear?): Promise<CalendarJSON | TaskListJSON>
│   │                           #   - editTask(uuid, fields, monthYear?): Promise<CalendarJSON | TaskListJSON>
│   │                           #   - getTaskList(): Promise<TaskListJSON>
│   │                           #   - setFeatured(uuid): Promise<void>
│   └── ThemeService.ts         # Lee ~/.cache/caelestia-shell/palette.json (o similar),
│                               # determina si paleta es oscura o clara,
│                               # genera objeto de variables CSS y las inyecta en el widget
│
├── windows/
│   ├── CalendarWindow.ts       # Ventana GTK Layer Shell modo calendario:
│   │                           #   - ancora: center o posición configurable
│   │                           #   - exclusivity: none
│   │                           #   - contiene: CalendarWidget
│   └── BarWindow.ts            # Ventana GTK Layer Shell modo barra:
│                               #   - ancora: top o configurable
│                               #   - exclusivity: exclusive (reserva espacio)
│                               #   - contiene: BarWidget
│
├── components/
│   │
│   ├── calendar/
│   │   ├── CalendarWidget.ts       # Raíz del modo calendario: encapsula Header + Grid
│   │   ├── CalendarHeader.ts       # Flecha izquierda + nombre del mes/año centrado + flecha derecha
│   │   │                           # Onclick flechas: actualiza currentMonthYear en AppState → llama getCalendar → actualiza calendarData
│   │   ├── CalendarGrid.ts         # CSS Grid 7 columnas: renderiza array de CalendarCell a partir de calendarData
│   │   ├── CalendarCellWidget.ts   # Una casilla del grid:
│   │   │                           #   - Número del día (opacidad reducida si isPast o !isCurrentMonth)
│   │   │                           #   - Lista de TaskChip dentro de la casilla
│   │   │                           #   - Hover: aparece botón "+" en esquina superior derecha → abre AddTaskDialog
│   │   ├── TaskChip.ts             # Representación compacta de tarea dentro de casilla:
│   │   │                           #   - Checkbox completado
│   │   │                           #   - Nombre de tarea
│   │   │                           #   - Botón papelera (eliminar)
│   │   │                           #   - Botón estrella (destacar): amarilla si isFeatured, vacía si no
│   │   └── AddTaskDialog.ts        # Popup/modal para introducir nombre y fecha de nueva tarea
│   │
│   └── bar/
│       ├── BarWidget.ts            # Raíz del modo barra: layout horizontal completo
│       ├── BarPrevButton.ts        # Flecha izquierda: navega al índice anterior en taskList (no completed),
│       │                           # actualiza barCurrentIndex y llama set-featured con el uuid de la tarea mostrada
│       ├── BarTaskDisplay.ts       # Centro de la barra:
│       │                           #   - Checkbox completado: toggle → editTask(uuid, {completed: true}) → texto se oscurece
│       │                           #   - Nombre de tarea: si supera 60% del ancho → overflow hidden + animación marquee CSS
│       │                           #   - Fecha límite (texto secundario)
│       ├── BarStarIndicator.ts     # Estrella amarilla fija (indica que lo mostrado es la tarea destacada)
│       └── BarNextButton.ts        # Flecha derecha: navega al índice siguiente en taskList (no completed),
│                                   # actualiza barCurrentIndex y llama set-featured con el uuid de la tarea mostrada
│
└── types/
    ├── CalendarJSON.ts         # Interfaces TypeScript del contrato de datos sección 4.1
    └── TaskListJSON.ts         # Interfaces TypeScript del contrato de datos sección 4.2
```

### 5.1 Gestión de Estados

El estado global reside en `AppState.ts` usando `Variable` de AGS. Los componentes se suscriben reactivamente. Los flujos son:

**Cambio de modo:**
```
Señal externa (keybind hyprland / comando toggle) 
→ AppState.mode cambia
→ CalendarWindow.visible / BarWindow.visible se recalculan
→ Si modo=barra: BackendService.getTaskList() → AppState.taskList actualiza
→ BarWidget se re-renderiza con tarea en barCurrentIndex
```

**Navegación barra (prev/next):**
```
Click BarPrevButton / BarNextButton
→ Calcula nuevo índice sobre taskList filtrando completed=false
→ AppState.barCurrentIndex actualiza
→ BackendService.setFeatured(taskList[newIndex].id)
→ AppState.featuredTaskId actualiza
→ BarTaskDisplay re-renderiza
```

**Hover casilla calendario:**
```
MouseEnter en CalendarCellWidget
→ Añade clase CSS "hovered" → botón "+" visible (opacity transition)
MouseLeave → clase eliminada → botón "+" oculto
```

### 5.2 Tematización Dinámica (caelestia-shell)

`ThemeService.ts` en el arranque y en cada refresco:

1. Lee el archivo de caché de paleta generado por `caelestia-shell` (ruta configurable, ej. `~/.cache/caelestia/colors.json`).
2. Determina si la paleta es oscura o clara (comparando luminosidad del color dominante).
3. Genera un bloque de CSS variables:
   - **Paleta oscura:** `--bg-primary: #0a0a0a`, `--bg-secondary: #111`, `--text-primary`, `--text-secondary`, `--accent`, `--border`, `--hover` derivados de la paleta de la caché.
   - **Paleta clara:** `--bg-primary: #f2f2f2` (95% blanco / 5% gris), `--bg-secondary: #e8e8e8`, el resto derivados de la caché.
4. Inyecta las variables en el CSS del widget mediante `provider.load_from_data()` de GTK3.
5. `style.css` usa exclusivamente las variables CSS — nunca colores hardcodeados — garantizando que el widget se adapte automáticamente.

**Variables CSS base:**
```css
:root {
  --bg-primary: ...;
  --bg-secondary: ...;
  --text-primary: ...;
  --text-muted: ...;
  --accent-color: ...;
  --border-color: ...;
  --hover-bg: ...;
  --star-active: #f5c518;
  --past-day-opacity: 0.35;
  --transition-speed: 180ms;
}
```

---

## 6. Roadmap de Desarrollo (Iterativo por Fases)

El proyecto se dividirá en subdocumentos de implementación. Cada fase produce código compilable/ejecutable de forma independiente antes de pasar a la siguiente.

---

### Fase 1 — Dominio C++ (`FASE_1_DOMAIN.md`)

**Objetivo:** Implementar todas las clases de dominio sin dependencias externas.

**Entregables:**
- `TaskId.hpp` — Generación de UUID v4, solo getter.
- `TaskName.hpp` — Validación max 60 chars, excepción en construcción si inválido.
- `TaskDueDate.hpp` — Validación formato `dd/mm/yyyy` y fecha real (manejo de bisiestos), comparación de fechas para ordenación.
- `TaskCompleted.hpp` — Wrapper bool.
- `Task.hpp / .cpp` — Agrega los 4 value objects, getters para todos, setters para name/dueDate/completed.
- `TaskNode.hpp` — Struct con `Task`, `shared_ptr<TaskNode> prev`, `shared_ptr<TaskNode> next`.
- `TaskList.hpp / .cpp` — Lista doblemente enlazada con insert ordenado, remove por uuid, findByUuid, getters/setters delegados.
- `CalendarCell.hpp / .cpp` — Día, flag isCurrentMonth, flag isPast, vector de Task.
- `Calendar.hpp / .cpp` — buildCells() y populateFromTaskList().
- `FeaturedTask.hpp / .cpp` — Almacena TaskId, getter/setter.
- Tests unitarios mínimos en `tests/domain/` para validar insert ordenado, buildCells() con abril 2026, y populateFromTaskList().

---

### Fase 2 — Repositorios e Infraestructura de Persistencia (`FASE_2_PERSISTENCE.md`)

**Objetivo:** Implementar la capa de persistencia y el contrato abstracto.

**Entregables:**
- `ITaskListRepository.hpp` — Interfaz pura con load(), save(), addTask(), removeTask(), updateTask().
- `IFeaturedTaskRepository.hpp` — Interfaz pura con loadFeatured(), saveFeatured().
- `JsonTaskListRepository.hpp / .cpp` — Implementación concreta con `nlohmann/json`. Ruta: `~/.local/share/task-calendar/tasks.json`. Serialización/deserialización completa de TaskList ↔ JSON.
- `JsonFeaturedTaskRepository.hpp / .cpp` — Implementación concreta. Ruta: `~/.local/share/task-calendar/featured.json`.
- Manejo de errores: archivo inexistente crea uno vacío, JSON malformado lanza excepción controlada.

---

### Fase 3 — Casos de Uso y Commands (`FASE_3_APPLICATION.md`)

**Objetivo:** Implementar todos los handlers y commands de la capa de aplicación.

**Entregables:**
- Todos los `*Command.hpp` con sus campos (structs simples, sin lógica).
- `GetCalendarHandler` — Carga TaskList, crea Calendar con el mes recibido, popula, devuelve Calendar.
- `AddTaskCalendarHandler` — Construye Task con los datos del command, llama repository.addTask(), devuelve Calendar actualizado.
- `RemoveTaskCalendarHandler` — Llama repository.removeTask(uuid), devuelve Calendar actualizado.
- `EditTaskCalendarHandler` — Carga lista, llama setters vía TaskList, llama repository.save(), devuelve Calendar.
- `GetTaskListHandler` — Llama repository.load(), devuelve TaskList.
- `AddTaskBarHandler`, `RemoveTaskBarHandler`, `EditTaskBarHandler` — Análogos a los de calendario sin devolver Calendar.
- `SetFeaturedTaskHandler` — Llama featuredRepository.saveFeatured(uuid).

---

### Fase 4 — CLI Controller y Binario (`FASE_4_CLI.md`)

**Objetivo:** Exponer todos los casos de uso como comandos CLI con salida JSON.

**Entregables:**
- `CliController.hpp / .cpp` — Parsea `argv[]`, mapea subcomandos y flags a Commands, instancia repositorios concretos, instancia handlers, invoca handle(), serializa respuesta a JSON con `nlohmann/json`, imprime en `stdout`.
- `main.cpp` — Instancia CliController, maneja código de salida (0 éxito, 1 error).
- Definición de todos los subcomandos y flags según tabla de la sección 4.4.
- Manejo de errores: imprime JSON de error (sección 4.3) en `stdout` con exit code 1.
- `CMakeLists.txt` completo: targets, dependencias, flags C++20.

**Verificación:** Ejecutar manualmente cada comando y validar JSON de salida contra las interfaces de sección 4.

---

### Fase 5 — Frontend AGS: Estado, Servicios y Tematización (`FASE_5_AGS_CORE.md`)

**Objetivo:** Implementar la infraestructura del frontend sin componentes visuales finales.

**Entregables:**
- `types/CalendarJSON.ts` y `types/TaskListJSON.ts` — Interfaces TypeScript completas del contrato.
- `state/AppState.ts` — Variables AGS reactivas para todos los campos del estado global.
- `services/BackendService.ts` — Todos los métodos con `Utils.execAsync`, parseo de JSON, manejo de errores (JSON type=error → throw).
- `services/ThemeService.ts` — Lectura de caché de caelestia-shell, lógica de detección oscuro/claro, generación e inyección de CSS variables.
- `style.css` — Skeleton completo con todas las variables CSS y clases base (sin componentes específicos aún).
- `app.ts` — Registro de ventanas, lógica de toggle de modo.

---

### Fase 6 — Frontend AGS: Componentes del Calendario (`FASE_6_AGS_CALENDAR.md`)

**Objetivo:** Implementar todos los componentes visuales del modo calendario.

**Entregables:**
- `CalendarHeader.ts` — Flechas + mes/año centrado, lógica de navegación de meses.
- `CalendarGrid.ts` — Grid 7 columnas, encabezados L-M-X-J-V-S-D.
- `CalendarCellWidget.ts` — Renderizado de casilla, estilos de día pasado, hover con botón "+".
- `TaskChip.ts` — Checkbox, nombre, papelera, estrella (amarilla si isFeatured).
- `AddTaskDialog.ts` — Inputs de nombre y fecha, botón confirmar → BackendService.addTask().
- `CalendarWindow.ts` — Ventana GTK Layer Shell con todas las propiedades de posicionamiento.
- CSS de componentes: hover suave (transition 180ms), bordes delgados, opacidad días pasados.

---

### Fase 7 — Frontend AGS: Componentes de la Barra (`FASE_7_AGS_BAR.md`)

**Objetivo:** Implementar todos los componentes visuales del modo barra.

**Entregables:**
- `BarPrevButton.ts` — Lógica de navegación a tarea anterior no completada, actualización de featuredTaskId.
- `BarTaskDisplay.ts` — Checkbox, texto con animación marquee CSS cuando supera 60% del ancho, fecha límite, lógica de oscurecimiento al marcar completado.
- `BarStarIndicator.ts` — Estrella amarilla estática indicando tarea activa.
- `BarNextButton.ts` — Lógica de navegación a tarea siguiente no completada, actualización de featuredTaskId.
- `BarWidget.ts` — Composición del layout horizontal completo.
- `BarWindow.ts` — Ventana GTK Layer Shell modo barra (exclusive layer).
- CSS: animación `marquee` (keyframes de translateX), layout flex con proporciones exactas.

---

### Fase 8 — Integración, Empaquetado y Scripts de Instalación (`FASE_8_INTEGRATION.md`)

**Objetivo:** Unir backend y frontend, crear scripts de arranque y configuración de Hyprland.

**Entregables:**
- Script `install.sh`: compila backend, instala binario en `~/.local/bin/task-calendar`, instala AGS app en directorio de configuración.
- Regla Hyprland `hyprland.conf` snippet: keybind para lanzar/cerrar el widget, keybind para toggle de modo.
- Script `launch.sh`: lanza `ags -b task-calendar -c ~/.config/task-calendar/app.ts`.
- Prueba de integración completa: verificar que AGS recibe y renderiza datos del backend en ambos modos.
- Documentación mínima en `README.md`: dependencias, instalación, uso.

---

## Apéndice: Decisiones de Diseño Abiertas

| Decisión | Opciones | Criterio de Resolución en Fase |
|---|---|---|
| Formato caché caelestia-shell | JSON / archivo de texto plano | Investigar en Fase 5 la estructura real de la caché |
| Número de semanas en CalendarGrid | Siempre 6 filas (42 celdas) vs dinámico (35 o 42) | Decidir en Fase 1 según el mes con menor y mayor distribución |
| Generación UUID en C++ | `<random>` manual v4 / librería `stduuid` / `uuid_generate` de libuuid | Decidir en Fase 1 según disponibilidad en vcpkg |
| Posición ventana calendario | Center / top-right / configurable | Exponer como variable de entorno o config en Fase 8 |
| Animación marquee en barra | CSS puro keyframes / JS interval | CSS puro preferido; JS como fallback en Fase 7 |
