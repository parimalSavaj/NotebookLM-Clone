import { Pool, PoolClient, QueryResultRow } from 'pg';
import { IDatabaseService } from './database.service.interface.ts';
import { DatabaseConfig, QueryResult } from './database.types.ts';

export class DatabaseService implements IDatabaseService {
  private static instance: DatabaseService | null = null;
  private pool: Pool;

  private constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      connectionString: config.connectionString,
    });
  }

  static getInstance(config?: DatabaseConfig): DatabaseService {
    if (!DatabaseService.instance) {
      if (!config) {
        throw new Error('DatabaseService requires config on first initialization');
      }
      DatabaseService.instance = new DatabaseService(config);
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<void> {
    const client = await this.pool.connect();
    client.release();
    console.log('Database connected successfully');
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    console.log('Database disconnected');
  }

  async query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const result = await this.pool.query<T>(sql, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0,
    };
  }

  async selectOne<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.pool.query<T>(sql, params);
    return result.rows[0] ?? null;
  }

  async selectMany<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.pool.query<T>(sql, params);
    return result.rows;
  }

  async insert(sql: string, params?: unknown[]): Promise<void> {
    await this.pool.query(sql, params);
  }

  async update(sql: string, params?: unknown[]): Promise<number> {
    const result = await this.pool.query(sql, params);
    return result.rowCount ?? 0;
  }

  async delete(sql: string, params?: unknown[]): Promise<number> {
    const result = await this.pool.query(sql, params);
    return result.rowCount ?? 0;
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }
}
