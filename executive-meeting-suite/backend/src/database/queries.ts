import { pool } from '../database';

export const query = {
  get: (sql: string, params: any[] = []) => pool.query(sql, params).then(r => r.rows),
  one: (sql: string, params: any[] = []) => pool.query(sql, params).then(r => r.rows[0]),
  run: (sql: string, params: any[] = []) => pool.query(sql, params),
};
