/**
 * Seed: 001_system_roles
 *
 * Seeds the system roles that are available globally.
 * These roles cannot be modified or deleted.
 */

import { Kysely } from 'kysely';
import { randomUUID } from 'crypto';
import {
  ROLE_OWNER,
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_CHEF,
  ROLE_SERVER,
  ROLE_CASHIER,
  ROLE_VIEWER,
} from '../../constants/permissions';

export async function seed(db: Kysely<any>): Promise<void> {
  const systemRoles = [
    {
      id: randomUUID(),
      restaurant_id: null, // System role
      name: 'Owner',
      description: 'Full control over the restaurant. Can delete restaurant and manage all aspects.',
      permissions: ROLE_OWNER.toString(),
      is_system_role: true,
      display_order: 100,
      color: '#8B5CF6', // Purple
    },
    {
      id: randomUUID(),
      restaurant_id: null,
      name: 'Admin',
      description: 'Nearly full control. Can manage all aspects except restaurant deletion.',
      permissions: ROLE_ADMIN.toString(),
      is_system_role: true,
      display_order: 90,
      color: '#EC4899', // Pink
    },
    {
      id: randomUUID(),
      restaurant_id: null,
      name: 'Manager',
      description: 'Can manage operations, orders, staff, inventory, and reports.',
      permissions: ROLE_MANAGER.toString(),
      is_system_role: true,
      display_order: 80,
      color: '#3B82F6', // Blue
    },
    {
      id: randomUUID(),
      restaurant_id: null,
      name: 'Chef',
      description: 'Kitchen-focused access. Can view orders, menu, inventory, and manage kitchen display.',
      permissions: ROLE_CHEF.toString(),
      is_system_role: true,
      display_order: 70,
      color: '#F59E0B', // Orange
    },
    {
      id: randomUUID(),
      restaurant_id: null,
      name: 'Server',
      description: 'Can create and update orders, manage tables, view menu and customers.',
      permissions: ROLE_SERVER.toString(),
      is_system_role: true,
      display_order: 60,
      color: '#10B981', // Green
    },
    {
      id: randomUUID(),
      restaurant_id: null,
      name: 'Cashier',
      description: 'Can process payments and view orders.',
      permissions: ROLE_CASHIER.toString(),
      is_system_role: true,
      display_order: 50,
      color: '#06B6D4', // Cyan
    },
    {
      id: randomUUID(),
      restaurant_id: null,
      name: 'Viewer',
      description: 'Read-only access to dashboard, orders, tables, menu, and reports.',
      permissions: ROLE_VIEWER.toString(),
      is_system_role: true,
      display_order: 10,
      color: '#6B7280', // Gray
    },
  ];

  // Check if roles already exist
  const existingRoles = await db
    .selectFrom('roles')
    .select('id')
    .where('is_system_role', '=', true)
    .where('restaurant_id', 'is', null)
    .execute();

  if (existingRoles.length > 0) {
    console.log('✓ System roles already seeded, skipping');
    return;
  }

  // Insert system roles
  await db.insertInto('roles').values(systemRoles).execute();

  console.log('✓ Seeded system roles:');
  systemRoles.forEach((role) => {
    console.log(`  - ${role.name}: ${role.description}`);
  });
}
