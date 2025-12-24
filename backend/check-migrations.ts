import { db } from './src/database/kysely';

async function checkMigrations() {
  try {
    const executedMigrations = await db
      .selectFrom('kysely_migration')
      .selectAll()
      .execute();
    
    console.log('Executed Migrations:');
    console.table(executedMigrations);
  } catch (error) {
    console.error('Failed to fetch migrations:', error);
  } finally {
    process.exit();
  }
}

checkMigrations();
