const assert = require('node:assert/strict');
const test = require('node:test');
const { UserUpdateEventsService } = require('../dist/user/user-update-events.service');

test('stores Redis user updates and emits them to SSE subscribers', async () => {
  let listener;
  let inserted;
  const database = {
    query: async (_sql, values) => {
      inserted = values;
      return { rows: [] };
    },
  };
  const redis = {
    subscribe: async (_channel, callback) => {
      listener = callback;
    },
    publish: async (_channel, message) => {
      await listener(message);
      return 1;
    },
  };
  const service = new UserUpdateEventsService(database, redis);
  let streamed;
  service.stream().subscribe((event) => {
    streamed = event;
  });
  await service.onModuleInit();

  const userId = '00000000-0000-4000-8000-000000000001';
  await service.publish(userId, { name: 'Budi' });

  assert.equal(inserted[1], userId);
  assert.deepEqual(JSON.parse(inserted[2]), { name: 'Budi' });
  assert.equal(streamed.type, 'user.updated');
  assert.equal(streamed.data.userId, userId);
});
