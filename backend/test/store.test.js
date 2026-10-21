import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/store.js';

test('crear recorta el título, asigna responsable y agrega al inicio', () => {
  const store = createStore();
  const task = store.createTask({ title: '  Practicar variables  ', assigneeId: 'u1' });
  assert.equal(task.title, 'Practicar variables');
  assert.equal(task.status, 'TODO');
  assert.equal(store.findUser(task.assigneeId).name, 'Carlos');
  assert.equal(store.listTasks()[0].id, task.id);
  assert.equal(store.listTasks().length, 4);
});

test('validación rechaza blancos, títulos largos y responsables inexistentes sin insertar', () => {
  const store = createStore();
  for (const input of [{ title: ' ' }, { title: 'x'.repeat(121) }, { title: 'Hola', assigneeId: 'missing' }]) {
    assert.throws(() => store.createTask(input), { code: 'BAD_USER_INPUT' });
  }
  assert.equal(store.listTasks().length, 3);
});

test('estado actualizado persiste y las instancias son independientes', () => {
  const store = createStore();
  assert.equal(store.setTaskStatus('t1', 'DONE').status, 'DONE');
  assert.equal(store.findTask('t1').status, 'DONE');
  assert.equal(createStore().findTask('t1').status, 'TODO');
  assert.throws(() => store.setTaskStatus('missing', 'DONE'), { code: 'NOT_FOUND' });
  assert.throws(() => store.setTaskStatus('t1', 'NOPE'), { code: 'BAD_USER_INPUT' });
});

test('una tarea sin responsable y una consulta sin coincidencia son válidas', () => {
  const store = createStore();
  assert.equal(store.createTask({ title: 'Sin responsable' }).assigneeId, null);
  assert.equal(store.findTask('missing'), null);
});
