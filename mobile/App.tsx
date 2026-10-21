import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { client } from "./src/apollo/client";
// import { BoardScreen } from "./src/screens/BoardScreen";
import { MoviesScreen } from "./src/screens/MoviesScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <ApolloProvider client={client}>
        {/* <BoardScreen /> */}
        <MoviesScreen />
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
