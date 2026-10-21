import { GraphQLError } from "graphql";
import { DomainError } from "./store.js";

function resolveDomain(action) {
  try {
    return action();
  } catch (error) {
    if (error instanceof DomainError) {
      throw new GraphQLError(error.message, {
        extensions: { code: error.code },
      });
    }
    throw error;
  }
}

// Firma: (parent, args, context, info). Solo declaramos los argumentos usados.
export const resolvers = {
  Query: {
    tasks: (_parent, _args, { store }) => store.listTasks(),
    task: (_parent, { id }, { store }) => store.findTask(id),
    users: (_parent, _args, { store }) => store.listUsers(),
    movies: (_parent, _args, { movieStore }) => movieStore.listMovies(),
    movie: (_parent, { id }, { movieStore }) => movieStore.findMovie(id),
  },
  Task: {
    // La entidad almacena assigneeId, pero el contrato expone el objeto User.
    assignee: (task, _args, { store }) => store.findUser(task.assigneeId),
  },
  Mutation: {
    createTask: (_parent, { input }, { store }) =>
      resolveDomain(() => store.createTask(input)),
    setTaskStatus: (_parent, { id, status }, { store }) =>
      resolveDomain(() => store.setTaskStatus(id, status)),
    rateMovie: (_parent, { input }, { movieStore }) =>
      resolveDomain(() => movieStore.rateMovie(input)),
  },
};
