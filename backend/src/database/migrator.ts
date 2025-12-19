/**
 * Database Migration Runner
 *
 * Handles running and rolling back database migrations.
 */

import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { promises as fs } from 'fs';
import path from 'path';
import { db } from './kysely';

const migrationFolder = path.join(__dirname, 'migrations');

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder,
  }),
});

/**
 * Run all pending migrations
 */
export async function migrateToLatest(): Promise<void> {
  console.log('Running migrations...');

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((result) => {
    if (result.status === 'Success') {
      console.log(`✓ Migration "${result.migrationName}" executed successfully`);
    } else if (result.status === 'Error') {
      console.error(`✗ Migration "${result.migrationName}" failed`);
    }
  });

  if (error) {
    console.error('Migration failed:', error);
    throw error;
  }

  console.log('✓ All migrations completed');
}

/**
 * Rollback the last migration
 */
export async function migrateDown(): Promise<void> {
  console.log('Rolling back last migration...');

  const { error, results } = await migrator.migrateDown();

  results?.forEach((result) => {
    if (result.status === 'Success') {
      console.log(`✓ Migration "${result.migrationName}" rolled back successfully`);
    } else if (result.status === 'Error') {
      console.error(`✗ Migration "${result.migrationName}" rollback failed`);
    }
  });

  if (error) {
    console.error('Rollback failed:', error);
    throw error;
  }

  console.log('✓ Rollback completed');
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<void> {
  const migrations = await db
    .selectFrom('kysely_migration')
    .selectAll()
    .orderBy('timestamp', 'asc')
    .execute();

  if (migrations.length === 0) {
    console.log('No migrations have been run yet');
    return;
  }

  console.log('\nMigration Status:');
  console.log('─────────────────────────────────────────────────────');
  migrations.forEach((migration) => {
    const status = migration.executed_at ? '✓' : '✗';
    console.log(`${status} ${migration.name} (${migration.timestamp})`);
  });
  console.log('─────────────────────────────────────────────────────\n');
}

// CLI support
if (require.main === module) {
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'up':
        case 'migrate':
          await migrateToLatest();
          break;
        case 'down':
        case 'rollback':
          await migrateDown();
          break;
        case 'status':
          await getMigrationStatus();
          break;
        default:
          console.log(`
Usage: bun run migrate <command>

Commands:
  up, migrate   Run all pending migrations
  down, rollback Roll back the last migration
  status        Show migration status
          `);
      }
      process.exit(0);
    } catch (error) {
      console.error('Migration error:', error);
      process.exit(1);
    }
  })();
}
