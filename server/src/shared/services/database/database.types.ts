export type DatabaseConfig = {
  connectionString: string;
};

export type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};
