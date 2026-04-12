# QuickTasks CLI - Backend Manual
Este documento detalla el uso del binario task-calendar para la gestión de tareas desde la terminal. Este binario es el motor que utiliza el frontend de AGS, pero puede usarse de forma independiente.

## Ubicación del Binario
Tras la instalación, el binario debería estar disponible en:
```~/.local/bin/task-calendar```

**Nota**: Si estás en el directorio de desarrollo, puedes encontrarlo en ```build/task-calendar```.

## Uso Global (Añadir al PATH)
Por defecto, el binario se instala en ```~/.local/bin```. Si al escribir ```task-calendar``` en tu terminal te dice comando no encontrado (```command not found```), significa que esa carpeta no está en tu variable de entorno PATH.

Para poder usar el comando desde cualquier directorio de tu sistema, sigue estos pasos:

### Añadir la ruta a tu configuración de Bash:
Ejecuta este comando una sola vez en tu terminal para añadir la carpeta a tu PATH permanentemente:

```Bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### Aplicar los cambios:
Para que la terminal actual reconozca el cambio sin tener que cerrarla, recarga el archivo de configuración:

```Bash
source ~/.bashrc
```

### Verificar:
Ahora deberías poder ejecutar el programa desde cualquier sitio. Compruébalo escribiendo:

```Bash
task-calendar --help
```
**Nota extra**: Si usas Zsh en lugar de Bash (muy común en Arch), simplemente cambia ~/.bashrc por ~/.zshrc en los comandos anteriores.

## Comandos Principales
### 1. Añadir una Tarea
Para añadir una nueva tarea, utiliza el comando ```add``` seguido del título, la fecha y la prioridad.

**Sintaxis**:

```Bash
task-calendar add "<título>" "<fecha: DD/MM/YYYY>" "<prioridad: 1-3>"
```
**Ejemplo**:

```Bash
task-calendar add "Comprar pan" "20/04/2026" "1"
```
### 2. Ver Tareas
Puedes listar todas las tareas guardadas en la base de datos local.

Sintaxis:

```Bash
task-calendar list
```
**Salida esperada:**
El sistema devolverá un JSON o una tabla (dependiendo de tu implementación) con los IDs de las tareas, títulos y estados.

### 3. Editar una Tarea
Para modificar una tarea existente, necesitas su ID (que puedes obtener con el comando ```list```).

Sintaxis:

```Bash
task-calendar edit <id> "<nuevo_título>" "<nueva_fecha>" "<nueva_prioridad>"
```

**Ejemplo:**

```Bash
task-calendar edit 42 "Comprar pan integral" "21/04/2026" "2"
```

### 4. Eliminar una Tarea
Para borrar una tarea de forma permanente.

Sintaxis:

```Bash
task-calendar delete <id>
```

**Ejemplo:**

```Bash
task-calendar delete 42
```

### 5. Marcar como Completada (Toggle)
Si quieres cambiar el estado de una tarea sin borrarla.

**Sintaxis:**

``` Bash
task-calendar toggle <id>
```
