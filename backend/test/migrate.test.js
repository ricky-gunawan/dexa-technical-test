const assert = require('node:assert/strict');
const { mkdtemp, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const test = require('node:test');
const { listMigrations } = require('../dist/migrate');

test('lists SQL migrations in filename order', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'migrations-'));
  await Promise.all([
    writeFile(join(directory, '002_second.sql'), ''),
    writeFile(join(directory, '001_first.sql'), ''),
    writeFile(join(directory, '001_first.down.sql'), ''),
    writeFile(join(directory, 'notes.txt'), ''),
  ]);

  assert.deepEqual(await listMigrations(directory), ['001_first.sql', '002_second.sql']);
});
