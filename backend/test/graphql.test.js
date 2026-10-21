import test from 'node:test';
import assert from 'node:assert/strict';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../src/schema.js';
import { resolvers } from '../src/resolvers.js';
import { createStore } from '../src/store.js';

test('operaciones GraphQL con resolvers reales y datos aislados', async t => {
  const store = createStore();
  const server = new ApolloServer({ typeDefs, resolvers, includeStacktraceInErrorResponses: false });
  t.after(() => server.stop());
  const execute = async (query, variables) => {
    const result = await server.executeOperation({ query, variables }, { contextValue: { store } });
    assert.equal(result.body.kind, 'single');
    return result.body.singleResult;
  };

  await t.test('resuelve una relación anidada y selecciona solo lo solicitado', async () => {
    const result = await execute('{ tasks { id assignee { name } } }');
    assert.equal(result.errors, undefined);
    assert.equal(result.data.tasks.length, 3);
    assert.equal(result.data.tasks[0].assignee.name, 'Carlos');
    assert.equal(result.data.tasks[0].title, undefined);
  });
  await t.test('variables, creación sin responsable y lectura posterior al cambio', async () => {
    const result = await execute('mutation Add($input: CreateTaskInput!) { createTask(input: $input) { id title assignee { id } } }', { input: { title: 'Desde GraphQL' } });
    assert.equal(result.errors, undefined);
    assert.equal(result.data.createTask.assignee, null);
    const id = result.data.createTask.id;
    const changed = await execute('mutation Change($id: ID!) { setTaskStatus(id: $id, status: DONE) { id status } }', { id });
    assert.equal(changed.data.setTaskStatus.status, 'DONE');
    const read = await execute('query Read($id: ID!) { task(id: $id) { title status } }', { id });
    assert.equal(read.data.task.status, 'DONE');
  });
  await t.test('errores de dominio y propagación de null', async () => {
    const invalid = await execute('mutation { createTask(input: { title: " " }) { id } }');
    assert.equal(invalid.errors[0].extensions.code, 'BAD_USER_INPUT');
    assert.equal(invalid.data, null);
    const missing = await execute('mutation { setTaskStatus(id: "missing", status: DONE) { id } }');
    assert.equal(missing.errors[0].extensions.code, 'NOT_FOUND');
    const read = await execute('{ task(id: "missing") { id } }');
    assert.equal(read.data.task, null);
  });
  await t.test('valida campos, enum y variables antes de ejecutar resolvers', async () => {
    for (const query of ['{ tasks { doesNotExist } }', 'mutation { setTaskStatus(id: "t1", status: INVALID) { id } }', 'query Read($id: ID!) { task(id: $id) { id } }']) {
      const result = await execute(query);
      assert.ok(result.errors.length);
      assert.equal(result.data, undefined);
    }
  });
});
