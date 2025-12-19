/**
 * MySQL Connection Pool
 *
 * Creates and manages a connection pool for MySQL database connections.
 * Uses mysql2/promise for async/await support.
 */

import mysql from 'mysql2/promise';

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
};

export const pool = mysql.createPool(config);

/**
 * Test database connection on startup
 */
export async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log('✓ MySQL connection established successfully');
    connection.release();
  } catch (error) {
    console.error('✗ MySQL connection failed:', error);
    throw error;
  }
}

/**
 * Close all connections in the pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('MySQL connection pool closed');
}
