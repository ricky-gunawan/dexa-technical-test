export interface DatabaseQueryResult<T> {
  rows: T[];
  rowCount: number | null;
}

export abstract class DatabaseService {
  abstract query<T extends object>(statement: string, values?: unknown[]): Promise<DatabaseQueryResult<T>>;
  abstract health(): Promise<string>;
}
