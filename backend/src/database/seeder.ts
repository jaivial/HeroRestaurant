/**
 * Database Seeder Runner
 *
 * Handles running database seeds for development and testing.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { db } from './kysely';

const seedsFolder = path.join(__dirname, 'seeds');

/**
 * Run all seed files
 */
export async function runSeeds(): Promise<void> {
  console.log('Running seeds...\n');

  try {
    const files = await fs.readdir(seedsFolder);
    const seedFiles = files
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
      .sort();

    for (const file of seedFiles) {
      const seedPath = path.join(seedsFolder, file);
      const seedModule = await import(seedPath);

      if (typeof seedModule.seed === 'function') {
        console.log(`Running seed: ${file}`);
        await seedModule.seed(db);
      } else {
        console.warn(`⚠ Seed file ${file} does not export a 'seed' function`);
      }
    }

    console.log('\n✓ All seeds completed');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

// CLI support
if (require.main === module) {
  (async () => {
    try {
      await runSeeds();
      process.exit(0);
    } catch (error) {
      console.error('Seeder error:', error);
      process.exit(1);
    }
  })();
}
