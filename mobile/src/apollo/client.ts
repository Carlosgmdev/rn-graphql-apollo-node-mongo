import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

// Android por USB (o emulador): ejecuta `npm run android:reverse` en la raíz.
// adb reverse conecta este puerto del dispositivo con el backend de tu computadora.
// iOS Simulator también puede acceder al backend por 127.0.0.1.
// Para dispositivo por Wi-Fi, reemplaza el host con la IP LAN de tu computadora.
export const GRAPHQL_URL = 'http://127.0.0.1:4000/graphql';

export const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  // Por defecto Apollo normaliza entidades por __typename + id.
  cache: new InMemoryCache(),
});
