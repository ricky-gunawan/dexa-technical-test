const assert = require('node:assert/strict');
const test = require('node:test');
const { UserService } = require('../dist/user/user.service');

test('hashes and verifies user passwords', async () => {
  let storedPassword;
  const database = {
    query: async (sql, parameters) => {
      if (sql.startsWith('INSERT')) {
        storedPassword = parameters[5];
        return { rows: [{ id: '1', name: 'Ayu' }] };
      }
      return {
        rows: [{ id: '1', name: 'Ayu', email: parameters[0], password: storedPassword }],
      };
    },
  };
  const service = new UserService(database);

  await service.create({
    name: 'Ayu',
    email: 'ayu@example.com',
    position: 'Engineer',
    password: 'secret123',
  });

  assert.notEqual(storedPassword, 'secret123');
  assert.match(storedPassword, /^\$2[aby]\$10\$.{53}$/);
  assert.equal((await service.authenticate({ email: 'ayu@example.com', password: 'secret123' })).id, '1');
  await assert.rejects(() => service.authenticate({ email: 'ayu@example.com', password: 'wrong' }));
});

test('publishes sanitized changes after updating a user', async () => {
  const published = [];
  const database = {
    query: async () => ({ rows: [{ id: '00000000-0000-4000-8000-000000000001', name: 'Budi' }] }),
  };
  const events = { publish: async (id, changes) => published.push({ id, changes }) };
  const service = new UserService(database, events);

  await service.update('00000000-0000-4000-8000-000000000001', {
    name: 'Budi',
    password: 'new-secret',
  });

  assert.deepEqual(published[0], {
    id: '00000000-0000-4000-8000-000000000001',
    changes: { name: 'Budi', passwordChanged: true },
  });
});

test('cursor-paginates users by name and id', async () => {
  const users = [
    { id: '00000000-0000-4000-8000-000000000001', name: 'Ayu' },
    { id: '00000000-0000-4000-8000-000000000002', name: 'Budi' },
    { id: '00000000-0000-4000-8000-000000000003', name: 'Cici' },
  ];
  const calls = [];
  const database = {
    query: async (_sql, values) => {
      calls.push(values);
      return { rows: calls.length === 1 ? users : [] };
    },
  };
  const service = new UserService(database);
  const page = await service.findAll({ limit: 2 });

  assert.equal(page.data.length, 2);
  assert.ok(page.nextCursor);
  await service.findAll({ limit: 2, cursor: page.nextCursor });
  assert.deepEqual(calls[1], ['Budi', users[1].id, 3]);
});
