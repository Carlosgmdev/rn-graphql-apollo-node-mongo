# GraphQL Interview Lab

Un tablero de tareas para refrescar Node.js, React Native **sin Expo**, GraphQL y Apollo, con un mini curso en español. La prioridad es entender el recorrido completo de una operación y poder explicarlo en una entrevista.

## Qué está implementado

- Backend Node.js (ES modules), Express 5 y Apollo Server 5.
- Schema con `Query`, `Mutation`, `input`, `enum`, relaciones y nullabilidad.
- Consultar tareas y responsables, consultar una tarea, crear tareas y cambiar su estado.
- App React Native 0.85.3 con TypeScript, proyectos Android/iOS, Hermes y Apollo Client 4.
- Formulario con selección de responsable, listado, carga, errores, reintento y pull to refresh.
- Caché normalizada para cambios de estado y actualización explícita de la lista al crear.
- Pruebas del dominio, operaciones GraphQL y caché; prueba HTTP adicional.

Los datos se guardan **en memoria**. Reiniciar el backend restaura tres tareas y dos usuarios. No necesitas base de datos, Docker ni cuentas externas. Los filtros todavía no están implementados: serán tu primer ejercicio.

## Requisitos

- Node.js **24 LTS** recomendado (`.nvmrc`); mínimo 22.11.
- npm, JDK 17 y Android Studio con emulador o dispositivo.
- Android SDK Platform 36, Build Tools 36.0.0 y NDK 27.1.12297006. Gradle puede descargar componentes faltantes si aceptaste las licencias.
- Para iOS: macOS, Xcode, Ruby y CocoaPods. En Linux puedes trabajar con Android.

## Arranque en Android

Desde la raíz:

```bash
npm run setup
```

Si las dependencias ya están instaladas, puedes pasar al arranque. `setup` usa los lockfiles para instalaciones reproducibles. No hay workspaces: backend y mobile mantienen dependencias independientes para facilitar el recorrido.

Terminal 1, backend:

```bash
npm run backend
```

Abre <http://localhost:4000/graphql> para explorar el schema en Apollo Sandbox. Hay operaciones listas para copiar en [backend/operations/playground.graphql](backend/operations/playground.graphql).

Terminal 2, Metro:

```bash
npm start
```

Abre un emulador desde Android Studio. Terminal 3:

```bash
npm run android:reverse
npm run android -- --no-packager
```

Si tu shell no encuentra el SDK, configura `ANDROID_HOME` y agrega `platform-tools` al `PATH`, o crea `mobile/android/local.properties` con `sdk.dir=/ruta/a/Android/Sdk`. La primera compilación descarga Gradle y dependencias nativas y tarda más.

Prueba manual: crea una tarea, cambia su estado, desliza para recargar y verifica que conserva el cambio. Reinicia el backend y recarga la app para volver al conjunto inicial.

### Conexión con el backend

La app usa `http://127.0.0.1:4000/graphql`. En Android, con dispositivo conectado por USB o emulador abierto, ejecuta desde la raíz:

```bash
npm run android:reverse
```

Esto conecta los puertos del backend (4000) y Metro (8081) del dispositivo con tu computadora. Recarga la app después. Repite el comando si desconectas el dispositivo o reinicias el emulador. Si hay varios dispositivos, ejecuta los comandos `adb -s SERIAL reverse tcp:4000 tcp:4000` y `adb -s SERIAL reverse tcp:8081 tcp:8081` para el dispositivo elegido.

Edita [mobile/src/apollo/client.ts](mobile/src/apollo/client.ts) según el dispositivo:

| Entorno | Host del backend |
| --- | --- |
| Android Emulator estándar | `127.0.0.1` con `npm run android:reverse`, o `10.0.2.2` sin reverse |
| iOS Simulator | `127.0.0.1` (predeterminado) |
| Android físico por USB | `127.0.0.1` con `npm run android:reverse` (predeterminado) |
| Dispositivo por Wi-Fi | IP LAN de tu computadora; misma red y puerto 4000 accesible |

Las excepciones HTTP locales de la plantilla permiten practicar en debug; para una app publicada configura HTTPS.

El backend escucha en `0.0.0.0:4000`. Puedes cambiarlo copiando `backend/.env.example` a `backend/.env`. Si cambias el puerto, actualiza también el cliente.

### iOS (en macOS)

```bash
cd mobile
bundle install
cd ios
bundle exec pod install
cd ../..
npm start
```

En otra terminal, desde la raíz: `npm run ios -- --no-packager`.

## Verificación

```bash
npm run typecheck
npm test
# Integración HTTP real: necesita permiso para abrir un puerto local
npm --prefix backend run test:http
# Solo dominio, sin instalar dependencias
npm run test:domain
```

Para comprobar manualmente Express:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  --data '{"query":"{ tasks { id title status assignee { name } } }"}'
```

Consulta [docs/VALIDACION.md](docs/VALIDACION.md) para distinguir lo comprobado aquí de las verificaciones pendientes en dispositivo.

## Mini curso

1. [Recorrido y fundamentos de GraphQL](docs/01-graphql.md): 35–45 min.
2. [Apollo Client y caché](docs/02-apollo.md): 35–45 min.
3. [Primer ejercicio guiado: filtros por estado](docs/03-ejercicio-filtros.md): 45–60 min.
4. [Ruta de práctica y simulación de entrevista](docs/04-ruta-entrevista.md): sesiones de 45–60 min.

Empezamos usando lo implementado. Después tú haces los cambios del ejercicio y revisamos tu razonamiento y código. Las pistas están separadas en bloques desplegables; no hay una solución completa del filtro que te quite la práctica.

## Mapa del código

```text
backend/src/schema.js          Contrato GraphQL (SDL)
backend/src/resolvers.js       Query, Mutation y relación Task.assignee
backend/src/store.js           Datos y reglas del dominio
backend/src/server.js          Express, Apollo y context
backend/operations/            Operaciones para experimentar
mobile/App.tsx                Providers
mobile/src/apollo/             Transporte y actualización de caché
mobile/src/graphql/            Operaciones y tipos TypeScript
mobile/src/screens/           Pantalla del tablero
mobile/android/               Proyecto Android nativo
mobile/ios/                   Proyecto iOS nativo
```

Backend en JavaScript moderno y cliente en TypeScript para concentrar la primera práctica en GraphQL. Los tipos del cliente son manuales: **no validan el contrato automáticamente**. Agregar GraphQL Code Generator es una sesión posterior.

## Referencias oficiales

- [React Native sin framework](https://reactnative.dev/docs/getting-started-without-a-framework).
- [Plantilla nativa 0.85](https://github.com/react-native-community/template/tree/0.85-stable), con su licencia en `mobile/NATIVE-TEMPLATE-LICENSE`.
- [Apollo Server con Express](https://www.apollographql.com/docs/apollo-server/api/express-middleware).
- [Apollo Client en React Native](https://www.apollographql.com/docs/react/integrations/react-native).
- [Consultas y fetch policies](https://www.apollographql.com/docs/react/data/queries).
- [Caché de Apollo](https://www.apollographql.com/docs/react/caching/overview).
- [Conceptos de GraphQL](https://graphql.org/learn/).
