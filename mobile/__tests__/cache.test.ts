import { InMemoryCache } from '@apollo/client';
import { addTaskToBoard } from '../src/apollo/updateBoard';
import { GET_BOARD, SET_TASK_STATUS, type Task } from '../src/graphql/operations';

const task: Task = {
  __typename: 'Task', id: 't1', title: 'Practicar', status: 'TODO',
  createdAt: '2026-10-01T09:00:00.000Z', assignee: null,
};

test('normalizar una mutación actualiza la tarea de una consulta existente', () => {
  const cache = new InMemoryCache();
  cache.writeQuery({ query: GET_BOARD, data: { tasks: [task], users: [] } });
  cache.writeQuery({ query: SET_TASK_STATUS, data: { setTaskStatus: { __typename: 'Task', id: task.id, status: 'DONE' } } });
  expect(cache.readQuery({ query: GET_BOARD })?.tasks[0].status).toBe('DONE');
});

test('crear agrega a la lista sin duplicar; normalizar por sí solo no basta', () => {
  const cache = new InMemoryCache();
  cache.writeQuery({ query: GET_BOARD, data: { tasks: [task], users: [] } });
  const created: Task = { ...task, id: 't2', title: 'Nueva tarea' };
  addTaskToBoard(cache, created);
  addTaskToBoard(cache, created);
  expect(cache.readQuery({ query: GET_BOARD })?.tasks.map(item => item.id)).toEqual(['t2', 't1']);
});
