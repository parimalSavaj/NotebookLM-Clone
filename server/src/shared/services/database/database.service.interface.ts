import { PoolClient, QueryResultRow } from 'pg';
import { QueryResult } from './database.types.ts';

export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  selectOne<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T | null>;
  selectMany<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]>;
  insert(sql: string, params?: unknown[]): Promise<void>;
  update(sql: string, params?: unknown[]): Promise<number>;
  delete(sql: string, params?: unknown[]): Promise<number>;
  getClient(): Promise<PoolClient>;
}
