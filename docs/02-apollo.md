# Sesión 2 · Apollo Client y la caché

**Objetivo:** explicar por qué la pantalla se actualiza después de una mutación y cuándo se necesita trabajo adicional.

## 1. Transporte, provider y hook

Lee en este orden:

1. `mobile/src/apollo/client.ts`: `HttpLink` envía las operaciones; `InMemoryCache` conserva entidades y resultados.
2. `mobile/App.tsx`: `ApolloProvider` hace accesible el cliente a los componentes.
3. `mobile/src/graphql/operations.ts`: documentos GraphQL, fragmento compartido y tipos del cliente.
4. `mobile/src/screens/BoardScreen.tsx`: `useQuery` maneja la lectura y `useMutation` las escrituras.

En Apollo Client 4, `ApolloProvider`, `useQuery` y `useMutation` se importan de `@apollo/client/react`. El cliente, la caché y `gql` vienen de `@apollo/client`.

Los tipos TypeScript ayudan al editor pero desaparecen en ejecución. Aquí se mantienen a mano: si cambias el schema, debes actualizar las operaciones y sus tipos. Codegen podrá automatizarlo después.

## 2. Políticas de lectura (10 min)

El tablero usa `cache-and-network`: puede mostrar datos de caché y también consulta al servidor. Predice qué cambiaría usando:

| Política | Comportamiento esperado |
| --- | --- |
| `cache-first` | Si la caché satisface la consulta, evita la petición de red. |
| `cache-and-network` | Usa caché disponible y consulta la red para actualizar. |
| `network-only` | Consulta la red y guarda el resultado en caché. |
| `no-cache` | Consulta la red sin guardar el resultado en caché. |

Cambia temporalmente la política, recarga y observa. El pull to refresh llama `refetch()` para volver a consultar la red. Después restaura la política original.

## 3. Actualizar una entidad existente (10 min)

Cambia el estado de una tarea y lee `SET_TASK_STATUS`.

La mutación retorna `id`, `status` y el `__typename` que Apollo agrega automáticamente. Por defecto, una tarea se identifica como `Task:t1`. Al recibir el nuevo estado, Apollo combina los campos en esa entidad y notifica a la consulta que la referencia.

**Experimento:** elimina temporalmente `id` de la selección de la mutación. Explica por qué la respuesta deja de identificar por defecto qué tarea del tablero actualizar. Restaura el documento al terminar.

No conviene omitir campos de identidad para ahorrar unos bytes si después tienes que volver a consultar todo el tablero.

## 4. Agregar una entidad a una lista (10 min)

Crea una tarea y lee `mobile/src/apollo/updateBoard.ts`.

Guardar una entidad nueva no le dice a Apollo en qué listas debe insertarla ni en qué orden. `updateQuery` agrega la tarea al resultado de `GET_BOARD`, preserva los usuarios y evita duplicados.

Elige una estrategia conscientemente:

- `refetchQueries`: simple y usa el resultado autoritativo del servidor; cuesta otra petición.
- `updateQuery` / `cache.modify`: actualiza localmente; tienes que respetar filtros y orden.
- `optimisticResponse`: muestra el cambio antes de la respuesta; debe tener una identidad y forma coherentes y manejar reversión ante errores.

El ejemplo base espera la respuesta real; el optimismo será otra práctica. Cuando agregues filtros, una tarea que cambia de estado puede dejar de pertenecer a la lista actual. La normalización sola no elimina referencias de listas filtradas.

## 5. Errores y estado local

`title` y `assigneeId` son estado del formulario y viven en React. Las tareas vienen del servidor y se gestionan con Apollo. No copies `data.tasks` a `useState` para mantener una segunda lista sincronizada.

`useQuery` expone `loading`, `error`, `data` y `networkStatus`. Hay diferencias entre la carga inicial y un refetch con datos previos. La app conserva el listado cuando puede mostrar datos existentes y ofrece reintentar si hay un fallo.

Las promesas de las mutaciones se capturan para evitar rechazos sin manejar. Los errores se muestran en el formulario o con una alerta. No confundas fallo de transporte con un error de negocio retornado por GraphQL.

## Checkpoint

1. ¿Qué problema resuelve Apollo además de enviar HTTP?
2. ¿Por qué cambiar estado no necesita `refetchQueries` aquí?
3. ¿Por qué crear una tarea sí necesita actualizar la lista?
4. ¿Qué diferencia hay entre `network-only` y `no-cache`?
5. ¿Qué ocurrirá con una lista filtrada en TODO si cambias una tarea a DONE?

Ejecuta `npm --prefix mobile test -- --runInBand`: las pruebas de caché ilustran los puntos 2 y 3 sin depender de un dispositivo.
