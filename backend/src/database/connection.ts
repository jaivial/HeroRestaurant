/**
 * MySQL Connection Pool
 *
 * Creates and manages a connection pool for MySQL database connections.
 * Uses mysql2 (not mysql2/promise) for Kysely compatibility.
 */

import mysql from 'mysql2';

// Environment configuration with defaults
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hero_restaurant',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: 'Z', // Store dates as UTC
  supportBigNumbers: true,
  bigNumberStrings: false, // Return as number if fits, but we'll use typeCast for BigInt
  typeCast: function (field: any, next: any) {
    if (field.type === 'LONGLONG') {
      const val = field.string();
      return val === null ? null : BigInt(val);
    }
    return next();
  },
};

export const pool = mysql.createPool(config);

/**
 * Test database connection on startup
 */
export function testConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('✗ MySQL connection failed:', err);
        reject(err);
        return;
      }
      console.log('✓ MySQL connection established successfully');
      connection.release();
      resolve();
    });
  });
}

/**
 * Close all connections in the pool
 */
export function closePool(): Promise<void> {
  return new Promise((resolve) => {
    pool.end(() => {
      console.log('MySQL connection pool closed');
      resolve();
    });
  });
}
