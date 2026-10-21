import type { ApolloCache } from '@apollo/client';
import { GET_BOARD, type Task } from '../graphql/operations';

export function addTaskToBoard(cache: ApolloCache, task: Task) {
  // Normalizar la entidad NO agrega su referencia a Query.tasks automáticamente.
  cache.updateQuery({ query: GET_BOARD }, board => {
    if (!board || board.tasks.some(item => item.id === task.id)) return board;
    return { ...board, tasks: [task, ...board.tasks] };
  });
}
