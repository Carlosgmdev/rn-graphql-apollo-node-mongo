# Primer ejercicio guiado · Filtrar tareas por estado

**Historia:** como usuario quiero ver todas las tareas o solo las pendientes, en progreso o terminadas, para concentrarme en una parte del tablero.

**Duración:** 45–60 minutos. El filtro está pendiente a propósito. Trabajaremos en pasos: tú implementas uno, me compartes qué cambiaste y revisamos antes de avanzar.

## Antes de escribir código (5 min)

Con la app base funcionando, explica con tus palabras:

1. ¿En qué capa debe filtrarse si mañana hay diez mil tareas?
2. ¿Qué argumento agregarías al campo `tasks`? ¿Debería ser obligatorio?
3. ¿“Todas” es un estado real de una tarea o una opción del filtro?
4. ¿Cómo identificaría Apollo dos resultados de `tasks` con distintos argumentos?

Anota tus respuestas aquí o respóndeme en el chat. No necesitas tenerlas perfectas.

## Paso 1 · Contrato y backend (10–15 min)

Archivos: `backend/src/schema.js`, `resolvers.js` y `store.js`.

- Agrega a `Query.tasks` un argumento opcional `status` de tipo `TaskStatus`.
- Cuando se omite o es null, devuelve todas las tareas.
- Si llega un estado, devuelve solo las tareas de ese estado.
- Conserva el orden y evita modificar la colección original al filtrar.
- No agregues `ALL` al enum del dominio.

Comprueba desde Sandbox, **antes de tocar React Native**:

```graphql
query TasksByStatus($status: TaskStatus) {
  tasks(status: $status) {
    id
    title
    status
  }
}
```

Prueba `{}`, `{"status":null}`, `{"status":"TODO"}`, `{"status":"IN_PROGRESS"}` y `{"status":"DONE"}`. Sobre los datos iniciales deberían salir 3, 3, 1, 1 y 1 tareas. Un valor `INVALID` debe ser rechazado por GraphQL.

<details>
<summary>Pista 1 · ¿Dónde llega el argumento?</summary>

Mira el segundo parámetro de `Query.task`. Los argumentos de `Query.tasks` llegan de la misma forma. El resolver adapta el argumento y el store realiza el filtrado.
</details>

<details>
<summary>Pista 2 · Opcionalidad</summary>

Compara `ID!` en la consulta por ID con el enum del argumento del filtro. Piensa en el significado de quitar `!`. Recuerda manejar tanto `undefined` como `null`.
</details>

**Punto de revisión:** explícame el recorrido del valor `"DONE"` desde Variables hasta el resultado del store.

## Paso 2 · Pruebas del contrato (5–10 min)

Extiende `backend/test/graphql.test.js` con estos casos:

- Omitir el filtro conserva las tres tareas iniciales.
- Un filtro devuelve solamente tareas del estado solicitado.
- Después de mover la única tarea TODO a DONE, consultar TODO devuelve `[]`.
- Una consulta por estado no altera una consulta posterior de todas las tareas.

Usa un store nuevo para cada escenario que dependa del conjunto inicial. Ejecuta `npm --prefix backend test`. No basta con que compile: estas pruebas deben detectar un resolver que ignore el filtro.

## Paso 3 · Operación y pantalla (15 min)

Archivos: `mobile/src/graphql/operations.ts` y `mobile/src/screens/BoardScreen.tsx`.

- Declara una variable opcional `$status` en `GetBoard` y pásala al campo `tasks`.
- Actualiza el tipo de variables de `GET_BOARD` para que coincida con el documento.
- Agrega botones “Todas”, “Pendientes”, “En progreso” y “Terminadas”.
- Guarda la selección del filtro en estado local y pásala a `useQuery` mediante `variables`.
- Muestra claramente la opción seleccionada y el estado vacío.
- La consulta debe cambiar por sus variables; no necesitas un `useEffect` que invoque `refetch` cada vez.

<details>
<summary>Pista 3 · ¿Qué hacer con “Todas”?</summary>

Puedes representar “Todas” con null en el estado del filtro, usando una unión con `TaskStatus`. GraphQL no necesita un estado adicional de tarea.
</details>

**Punto de revisión:** verifica el documento, los tipos y las variables reales. Un tipo TypeScript correcto no arregla un documento GraphQL incorrecto.

## Paso 4 · Mutaciones con listas filtradas (10–15 min)

Este paso es el más importante para Apollo. El helper base `addTaskToBoard` trabaja con una única consulta sin variables. **Debes adaptar o sustituir esa estrategia** cuando introduzcas filtros.

Primero usa una estrategia sencilla de volver a consultar la lista activa tras una mutación y esperar ese refetch. Después, como ampliación, podremos usar actualizaciones de caché que respeten el filtro.

Comprueba los siguientes casos:

| Acción | Resultado esperado |
| --- | --- |
| En “Todas”, crear tarea | Aparece una sola vez al inicio. |
| En “Pendientes”, crear tarea | Aparece: toda tarea nueva empieza en TODO. |
| En “Terminadas”, crear tarea | No aparece en esa lista. Sí aparece al ir a “Todas”. |
| En “Pendientes”, pasar una tarea a IN_PROGRESS | Desaparece de esa lista y aparece en “En progreso”. |
| Cambiar de filtro y volver | Se muestran los resultados correctos, sin duplicados. |
| Error de red al cambiar estado | Hay un error visible; el estado no se presenta como guardado. |

<details>
<summary>Pista 4 · Identidad de entidad vs. pertenencia a una lista</summary>

Apollo puede actualizar `Task:t1.status`, pero eso no vuelve a ejecutar el filtro del backend sobre las referencias guardadas en `Query.tasks`. Las consultas con argumentos tienen entradas distintas de caché por defecto. Revisa `refetchQueries`, `awaitRefetchQueries` y cómo apuntar a la operación activa con sus variables.
</details>

No desactives la caché para ocultar inconsistencias. Decide cómo quieres sincronizar los resultados.

## Criterios de terminado

- El backend filtra realmente y las consultas sin argumentos siguen funcionando.
- La pantalla tiene cuatro opciones con estados de carga, error y vacío.
- Crear y cambiar estado respetan el filtro activo.
- Pasan backend tests, pruebas de caché actualizadas y `npm run typecheck`.
- Puedes explicar en dos minutos qué resuelve la normalización y qué responsabilidad queda para la lista.

Cuando termines el paso 1, dime: **“Revisa mi paso 1 del filtro”**. Revisaremos corrección, nullabilidad y claridad como si fuera una entrevista, sin adelantarte la solución completa.
