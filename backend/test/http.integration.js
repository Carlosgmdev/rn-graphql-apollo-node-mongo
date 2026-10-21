import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';

async function request(url, query, variables) {
  const response = await fetch(`${url}/graphql`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return { status: response.status, body: await response.json() };
}

test('HTTP → Express → Apollo → resolvers → store', async t => {
  const { httpServer, apollo } = await createApp();
  t.after(() => apollo.stop());
  await new Promise(resolve => httpServer.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${httpServer.address().port}`;

  await t.test('health y relación anidada', async () => {
    assert.equal((await fetch(`${url}/health`)).status, 200);
    const { body } = await request(url, '{ tasks { id assignee { id name } } }');
    assert.equal(body.errors, undefined);
    assert.equal(body.data.tasks.length, 3);
    assert.equal(body.data.tasks[0].assignee.name, 'Carlos');
  });
  await t.test('mutación con variables y lectura posterior', async () => {
    const { body } = await request(url, 'mutation Add($input: CreateTaskInput!) { createTask(input: $input) { id title status assignee { id } } }', { input: { title: 'Desde HTTP' } });
    assert.equal(body.errors, undefined);
    assert.equal(body.data.createTask.assignee, null);
    const id = body.data.createTask.id;
    const changed = await request(url, 'mutation Change($id: ID!) { setTaskStatus(id: $id, status: DONE) { id status } }', { id });
    assert.equal(changed.body.data.setTaskStatus.status, 'DONE');
    const read = await request(url, 'query Read($id: ID!) { task(id: $id) { title status } }', { id });
    assert.equal(read.body.data.task.status, 'DONE');
  });
  await t.test('errores de dominio y nullabilidad', async () => {
    const invalid = await request(url, 'mutation { createTask(input: { title: " " }) { id } }');
    assert.equal(invalid.body.errors[0].extensions.code, 'BAD_USER_INPUT');
    assert.equal(invalid.body.data, null);
    const missing = await request(url, 'mutation { setTaskStatus(id: "missing", status: DONE) { id } }');
    assert.equal(missing.body.errors[0].extensions.code, 'NOT_FOUND');
    const read = await request(url, '{ task(id: "missing") { id } }');
    assert.equal(read.body.data.task, null);
  });
  await t.test('GraphQL valida campos, enums y variables antes del resolver', async () => {
    for (const query of ['{ tasks { doesNotExist } }', 'mutation { setTaskStatus(id: "t1", status: INVALID) { id } }']) {
      const invalid = await request(url, query);
      assert.equal(invalid.status, 400);
      assert.ok(invalid.body.errors.length);
    }
    const missing = await request(url, 'query Read($id: ID!) { task(id: $id) { id } }');
    assert.ok(missing.body.errors.length);
  });
});
