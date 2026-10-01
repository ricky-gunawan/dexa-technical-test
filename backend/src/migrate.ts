import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Pool } from 'pg';

export async function listMigrations(directory: string) {
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql') && !entry.name.endsWith('.down.sql'))
    .map((entry) => entry.name)
    .sort();
}

export async function migrate(direction: 'up' | 'down') {
  const directory = resolve(process.cwd(), 'migrations');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/app',
  });
  const client = await pool.connect();

  try {
    await client.query("SELECT pg_advisory_lock(hashtext('app_sql_migrations'))");
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    if (direction === 'down') {
      const { rows } = await client.query<{ name: string }>(
        'SELECT name FROM schema_migrations ORDER BY applied_at DESC, name DESC LIMIT 1',
      );
      if (!rows[0]) {
        console.log('Nothing to roll back');
        return;
      }

      const name = rows[0].name;
      const downFile = name.replace(/\.sql$/, '.down.sql');
      await client.query('BEGIN');
      try {
        await client.query(await readFile(resolve(directory, downFile), 'utf8'));
        await client.query('DELETE FROM schema_migrations WHERE name = $1', [name]);
        await client.query('COMMIT');
        console.log(`Rolled back ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
      return;
    }

    const applied = new Set(
      (await client.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map(({ name }) => name),
    );

    for (const name of await listMigrations(directory)) {
      if (applied.has(name)) continue;

      await client.query('BEGIN');
      try {
        await client.query(await readFile(resolve(directory, name), 'utf8'));
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
        await client.query('COMMIT');
        console.log(`Applied ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  const direction = process.argv[2];
  if (direction !== 'up' && direction !== 'down') throw new Error('Migration direction must be "up" or "down"');

  migrate(direction).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
