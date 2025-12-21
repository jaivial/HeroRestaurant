#!/usr/bin/env bun
/**
 * Development Setup Script
 *
 * Runs migrations and seeds before starting the dev server.
 * This ensures the database is always in sync with the code.
 *
 * Usage: bun run src/scripts/dev-setup.ts
 */

import { migrateToLatest } from '../database/migrator';
import { runSeeds } from '../database/seeder';
import { testConnection, closePool } from '../database/connection';
import { db } from '../database/kysely';

async function setup(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  HeroRestaurant - Development Setup');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Test database connection
    console.log('Testing database connection...');
    await testConnection();
    console.log('');

    // Run migrations
    console.log('Running database migrations...');
    await migrateToLatest();
    console.log('');

    // Run seeds
    console.log('Running database seeds...');
    await runSeeds();
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    console.log('  Setup complete! Starting development server...');
    console.log('═══════════════════════════════════════════════════════\n');

    await db.destroy();
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Setup failed:', error);
    await db.destroy();
    await closePool();
    process.exit(1);
  }
}

// Run setup
await setup();
