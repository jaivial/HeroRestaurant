import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // We'll update the display_order of existing roles if needed, 
  // but for now let's just ensure we have a clear understanding that 
  // higher display_order means higher priority.
  
  // Add a comment to the column to clarify its usage
  await sql`ALTER TABLE roles MODIFY COLUMN display_order INTEGER NOT NULL DEFAULT 0 COMMENT 'Higher value means higher priority (e.g. 100 is Owner, 0 is Viewer)'`.execute(db);

  console.log('✓ Refined roles table priority logic');
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE roles MODIFY COLUMN display_order INTEGER NOT NULL DEFAULT 0`.execute(db);
  console.log('✓ Reverted roles table priority refinement');
}

