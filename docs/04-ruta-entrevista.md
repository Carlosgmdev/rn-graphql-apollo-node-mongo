# Ruta de práctica · De refrescar a defender decisiones

Trabaja una sesión a la vez. En cada una: 10 minutos de explicación, 25–35 de implementación y 10 de preguntas. La meta no es memorizar APIs: es poder elegir una solución, implementarla y explicar sus límites.

| Sesión | Funcionalidad o actividad | Conceptos | Evidencia para cerrar |
| --- | --- | --- | --- |
| 1 | Explorar el backend existente | SDL, operaciones, variables, relaciones, nullabilidad, errores | Ejecutar consultas y mutaciones y narrar los resolvers. |
| 2 | Explorar el cliente existente | Provider, hooks, fragmentos, caché, fetch policies | Explicar los dos tests de caché y comparar políticas. |
| 3 | Implementar filtros (guía 03) | Argumentos opcionales, variables reactivas, listas filtradas | Superar los casos de aceptación del filtro. |
| 4 | Editar título y eliminar tarea | Inputs, validación, `cache.modify`, `evict`, errores | Editar en todos los sitios donde aparece; borrar sin referencias visibles obsoletas. |
| 5 | Cambio de estado optimista | `optimisticResponse`, identidad, rollback, solicitudes concurrentes | Respuesta inmediata y reversión comprobada ante error. |
| 6 | Paginar las tareas | Cursor, `pageInfo`, `fetchMore`, `typePolicies`, `keyArgs`, `merge` | Cargar otra página sin duplicados; filtros independientes. |
| 7 | Agregar contexto de usuario | Context por solicitud, autenticación, autorización en resolvers | Rechazar una mutación sin identidad; comprobar permisos en servidor. |
| 8 | Mejorar contrato y acceso a datos | GraphQL Code Generator, N+1, DataLoader por solicitud | Detectar un documento inválido y medir consultas de una relación. |
| 9 | Simulación cronometrada | Diagnóstico, diseño, código, pruebas y explicación | Resolver un cambio pequeño en 45 minutos y defender decisiones. |

No están implementadas las sesiones 3–9. Son ampliaciones sobre una base pequeña que ya puedes recorrer.

## Sesión de simulación (45 min)

**Enunciado:** “Permite reasignar una tarea a un usuario o dejarla sin responsable. Refleja el resultado en el tablero sin recargar toda la app. Maneja una tarea y un usuario inexistentes.”

- 0–5 min: aclara requisitos y diseña el contrato.
- 5–15 min: implementa schema, resolver y validación.
- 15–30 min: operación, UI y sincronización con Apollo.
- 30–40 min: prueba éxito, null, errores y red.
- 40–45 min: explica decisiones y qué cambiarías en producción.

Habla durante la práctica: “El ID identifica la entidad para actualizarla en caché”, “La autorización debe comprobarse en servidor”, “Esta validación es de negocio, no de forma del documento”. Si te atoras, reduce el caso y confirma primero el backend desde Sandbox.

## Preguntas que debes poder responder

### GraphQL y Node

1. ¿Cuándo elegirías GraphQL frente a REST? ¿Qué complejidad agrega?
2. ¿Qué diferencia una Query de una Mutation? ¿Quién garantiza que una Query no escriba datos?
3. ¿Por qué los tipos de entrada y salida son distintos?
4. ¿Cómo cambia el comportamiento al agregar `!`?
5. ¿Cómo representarías un error de negocio y datos parciales?
6. ¿Qué pondrías en context? ¿Por qué un loader con caché de usuarios no debería compartirse entre solicitudes?
7. ¿Qué es N+1? ¿Qué resuelven batching y caching en DataLoader?
8. ¿Qué trabajo bloquea el event loop de Node? ¿Cómo cambia si el resolver hace I/O asíncrono o cálculo pesado?
9. ¿Cómo pondrías límites a una consulta costosa? Piensa en paginación, complejidad, profundidad, tiempos y autorización.
10. ¿Qué parte de una mutación tendría que ser transaccional si hubiera una base de datos?

### Apollo y React Native

1. ¿Qué vive en React y qué vive en la caché de Apollo?
2. ¿Cómo construye Apollo una identidad por defecto? ¿Qué harías con una clave compuesta?
3. ¿Por qué devolver una entidad actualizada puede bastar para editar, pero no para insertar o eliminar de una lista?
4. ¿Cómo mantendrías coherentes varias listas filtradas o paginadas?
5. ¿Qué riesgos tiene una respuesta optimista y cómo la probarías?
6. ¿Cuándo elegirías `refetchQueries` frente a `cache.modify`?
7. ¿Cómo manejarías carga inicial, refresh, datos previos y errores?
8. ¿Por qué no se usa `localhost` para acceder a tu computadora desde Android Emulator?
9. ¿Qué problema resuelve `FlatList` y para qué sirve `keyExtractor`?
10. ¿Cómo evitarías duplicar datos del servidor con un `useState` sincronizado por efectos?

## Forma de trabajar juntos

Pídeme revisión por paso o una sesión concreta. Te pediré una predicción, revisaré el comportamiento y te daré pistas progresivas. Si me pides una simulación de entrevista, presentaré el enunciado y haré preguntas sin resolverlo por ti de entrada.

Primera actividad recomendada: completa la sesión 1 y responde las cinco preguntas de su checkpoint. Eso nos permitirá ajustar la profundidad del resto del curso a lo que ya dominas.
