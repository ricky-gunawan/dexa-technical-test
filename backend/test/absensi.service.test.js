const assert = require('node:assert/strict');
const test = require('node:test');
const { AbsensiService } = require('../dist/absensi/absensi.service');

const records = [
  { id: '00000000-0000-4000-8000-000000000003', userId: 'u', createdAt: new Date('2026-01-03Z'), status: 'masuk' },
  { id: '00000000-0000-4000-8000-000000000002', userId: 'u', createdAt: new Date('2026-01-02Z'), status: 'pulang' },
  { id: '00000000-0000-4000-8000-000000000001', userId: 'u', createdAt: new Date('2026-01-01Z'), status: 'masuk' },
];

test('filters and cursor-paginates attendance records', async () => {
  const calls = [];
  const database = {
    query: async (sql, values) => {
      calls.push({ sql, values });
      return { rows: calls.length === 1 ? records : [] };
    },
  };
  const service = new AbsensiService(database);
  const page = await service.findAll({ from: '2026-01-01T00:00:00Z', to: '2026-01-31T00:00:00Z', limit: 2 });

  assert.equal(page.data.length, 2);
  assert.ok(page.nextCursor);
  await service.findAll({ cursor: page.nextCursor, limit: 2 });
  assert.match(calls[0].sql, /JOIN "user"/);
  assert.equal(calls[0].values[5], 3);
  assert.equal(calls[1].values[2].toISOString(), records[1].createdAt.toISOString());
  assert.equal(calls[1].values[3], records[1].id);

  const userId = '00000000-0000-4000-8000-000000000004';
  await service.findAll({ userId, limit: 2 });
  assert.equal(calls[2].values[4], userId);
});
