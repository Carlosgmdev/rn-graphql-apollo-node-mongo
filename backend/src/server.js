import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { createStore } from "./store.js";
import { createMovieStore } from "./movie.store.js";

export async function createApp() {
  const app = express();
  const httpServer = createServer(app);
  const store = createStore();
  const movieStore = createMovieStore();

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    includeStacktraceInErrorResponses: false,
  });

  await apollo.start();
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  // CORS abierto para este laboratorio local. En producción se restringen los orígenes.
  app.use(
    "/graphql",
    cors(),
    express.json({ limit: "100kb" }),
    expressMiddleware(apollo, {
      // Context es el lugar para dependencias y, más adelante, el usuario autenticado.
      context: async () => ({ store, movieStore }),
    }),
  );
  return { app, httpServer, apollo, store };
}
