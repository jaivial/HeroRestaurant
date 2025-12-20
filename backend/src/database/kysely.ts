/**
 * Kysely Database Instance
 *
 * Type-safe SQL query builder for MySQL.
 */

import { Kysely, MysqlDialect } from 'kysely';
import { pool } from './connection';
import type { DB } from '../types/database';

export const db = new Kysely<DB>({
  dialect: new MysqlDialect({ pool: pool as any }),
});
