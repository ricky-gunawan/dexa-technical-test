import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseQueryResult, DatabaseService } from './database.service';

@Injectable()
export class PostgresDatabaseService extends DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    super();
    this.pool = new Pool({
      connectionString: config.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/app'),
    });
  }

  async onModuleInit() {
    await this.pool.query('SELECT 1');
  }

  async query<T extends object>(statement: string, values: unknown[] = []): Promise<DatabaseQueryResult<T>> {
    const result = await this.pool.query(statement, values);
    return { rows: result.rows as T[], rowCount: result.rowCount };
  }

  async health() {
    await this.pool.query('SELECT 1');
    return 'ok';
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
