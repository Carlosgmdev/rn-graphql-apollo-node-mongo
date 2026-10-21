# Validación del proyecto base

Comprobado el 21 de octubre de 2026 con Node.js 24.19.0, npm 11.17.0 y JDK 17.

## Comprobado

- Instalación de backend y mobile; lockfiles independientes incluidos.
- TypeScript del cliente: `npm run typecheck`.
- Dominio y operaciones con Apollo Server real: nueve comprobaciones, sin fallos. Incluyen relaciones, variables, creación, cambio de estado, validación, errores y nullabilidad.
- Caché real de Apollo Client: dos pruebas, sin fallos. Verifican actualización de una entidad normalizada e inserción en lista sin duplicados.
- Inicialización de Express, middleware de Apollo y cierre del servidor, sin abrir un puerto.
- Metro genera el bundle Android de producción sin errores de resolución o transformación.
- Proyectos Android e iOS copiados de `@react-native-community/template@0.85.3`, con nombre `InterviewLab` y paquete Android `com.interviewlab`. Incluyen wrapper Gradle, recursos nativos, proyecto Xcode y Podfile.

La generación del bundle mostró una advertencia del sandbox al intentar ejecutar `setup_env.sh`; Metro continuó y escribió el bundle correctamente.

## Pendiente en tu entorno de ejecución

El sandbox bloquea abrir puertos locales (`listen EPERM`). La prueba HTTP se intentó y quedó impedida por esa restricción. Por eso no se afirma una ejecución completa de la app o una compilación de APK.

Desde una terminal con acceso normal:

```bash
npm --prefix backend run test:http
npm run backend
# Otra terminal
npm start
# Otra terminal, con emulador abierto
npm run android -- --no-packager
```

Comprueba manualmente cargar el listado, crear con/sin responsable, cambiar estado, recargar y mostrar error al detener el backend. Una compilación Android necesita acceso a Gradle/Maven y al SDK; no se ejecutó aquí. iOS requiere macOS/Xcode y tampoco se compiló en este entorno Linux.

Las versiones exactas de las dependencias JavaScript quedan fijadas en `backend/package-lock.json` y `mobile/package-lock.json`. `npm run setup` usa `npm ci` para reproducirlas.
