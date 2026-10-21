# Sesión 1 · Sigue una operación de punta a punta

**Objetivo:** consultar y modificar el tablero desde Sandbox y explicar qué hace cada capa. No cambies la app todavía.

## Modelo mental

GraphQL define un contrato y ejecuta los campos que pide una operación. Express maneja HTTP; Apollo Server valida y ejecuta GraphQL; los resolvers obtienen datos del store. GraphQL no reemplaza tu base de datos y no necesita Apollo para existir.

En este proyecto el recorrido es:

```text
Documento + variables → POST /graphql → validación del schema
→ resolver raíz → store → resolvers de relaciones → { data, errors? }
```

Abre `backend/src/schema.js`. `tasks: [Task!]!` significa que la lista nunca es null y sus elementos tampoco: `[]` sí es válido. `task(id: ID!): Task` requiere un identificador, pero permite devolver null si no existe. `assignee: User` permite tareas sin responsable. `ID` es un identificador del contrato; no implica una tabla ni que sea un entero.

## 1. Selección de campos (5 min)

Con el backend levantado, abre `http://localhost:4000/graphql` y ejecuta:

```graphql
query MyFirstQuery {
  tasks {
    id
    title
    assignee { name }
  }
}
```

Antes de ejecutar, predice la forma de `data`. Después quita `assignee` y compara la respuesta. Solicita un campo inexistente: ¿se ejecuta el resolver o la validación lo rechaza antes?

Pedir menos campos reduce lo que el servidor responde. No garantiza por sí solo que el acceso a la base de datos sea más eficiente: eso depende de los resolvers.

## 2. Variables y nullabilidad (10 min)

```graphql
query TaskById($id: ID!) {
  task(id: $id) {
    id
    title
    status
    assignee { id name role }
  }
}
```

En el panel Variables escribe `{"id":"t1"}`. Prueba después `"missing"` y omitir la variable. Explica por qué una consulta puede devolver `task: null` sin error y otra rechazarse antes de ejecutar.

Las variables son datos separados del documento. Evitan concatenar strings y permiten reutilizar y tipar operaciones. Un `input` agrupa argumentos de entrada; un tipo de salida como `Task` no se usa como input.

## 3. Mutaciones (10 min)

Usa `CreateTask` y `SetTaskStatus` de `backend/operations/playground.graphql`.

1. Crea una tarea con responsable `u1` y consulta su ID devuelto.
2. Cambia su estado con ese ID.
3. Crea una tarea sin responsable.
4. Intenta un título `"   "`, un responsable inexistente y un estado `INVALID`.

Distingue validación de GraphQL (por ejemplo, enum incorrecto) de validación del dominio (título vacío después de trim). Observa `errors[].extensions.code`.

Las mutaciones piden campos de retorno igual que las consultas. Sus campos raíz se ejecutan en serie dentro de una operación; eso **no significa** que haya una transacción automática ni exclusión mutua entre solicitudes.

## 4. Recorre los resolvers (10 min)

Lee `resolvers.js` y sigue `Query.tasks` → `store.listTasks()` → `Task.assignee`.

La firma es `(parent, args, context, info)`:

- `parent`: resultado del campo padre; en `Task.assignee`, es una tarea.
- `args`: argumentos del campo, ya validados por GraphQL.
- `context`: dependencias y datos compartidos por la ejecución; aquí contiene el store.
- `info`: metadatos de ejecución y selección de campos.

No hay resolvers explícitos para `Task.title` o `User.name`: el resolver por defecto lee la propiedad con ese nombre del objeto padre.

La memoria simplifica el ejemplo. Si `Task.assignee` hiciera una consulta SQL por tarea, aparecería el problema N+1. Más adelante lo resolveremos con batching y DataLoader por solicitud.

## Checkpoint: contéstame sin consultar el código

1. ¿Qué diferencia hay entre schema, operación y resolver?
2. ¿Qué representan `Task`, `Task!`, `[Task!]!` y `[]`?
3. ¿Por qué `assigneeId` se almacena internamente y `assignee` aparece en el contrato?
4. ¿Por qué una respuesta con HTTP 200 puede contener `errors`?
5. Si un resolver de un campo no nullable falla, ¿hasta dónde se propaga null?

No todo error GraphQL usa HTTP 200: errores de parseo/validación suelen usar 400. En errores de ejecución puede haber datos parciales y `errors`; null se propaga hasta un padre nullable. Observa cada caso en lugar de evaluar únicamente el código HTTP.
