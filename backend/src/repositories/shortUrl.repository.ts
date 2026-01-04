import { db } from '../database/kysely';
import type { ShortUrl } from '../types/database.types';

function generateBase62Code(): string {
  const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const CODE_LENGTH = 10;
  const uuid = crypto.randomUUID().replace(/-/g, '');
  
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const hexSegment = uuid.substring(i * 3, i * 3 + 3);
    const charIndex = parseInt(hexSegment, 16) % BASE62_CHARS.length;
    code += BASE62_CHARS[charIndex];
  }
  
  return code;
}

export const shortUrlRepository = {
  async create(menuId: string): Promise<ShortUrl> {
    const MAX_COLLISION_RETRIES = 5;
    const DUPLICATE_ENTRY_ERROR = 'ER_DUP_ENTRY';
    
    for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
      const code = generateBase62Code();
      const id = crypto.randomUUID();
      
      try {
        await db.insertInto('short_urls')
          .values({
            id,
            code,
            menu_id: menuId,
            created_at: new Date()
          })
          .execute();
        
        return { id, code, menu_id: menuId, created_at: new Date() };
      } catch (error: any) {
        const isCollision = error?.code === DUPLICATE_ENTRY_ERROR;
        if (!isCollision) throw error;
      }
    }
    
    throw new Error('Failed to generate unique short URL after multiple attempts');
  },

  async getByCode(code: string): Promise<ShortUrl | undefined> {
    return await db.selectFrom('short_urls')
      .selectAll()
      .where('code', '=', code)
      .executeTakeFirst();
  },

  async getOrCreate(menuId: string): Promise<ShortUrl> {
    const existing = await db.selectFrom('short_urls')
      .selectAll()
      .where('menu_id', '=', menuId)
      .executeTakeFirst();
    
    if (existing) return existing;
    
    return await this.create(menuId);
  }
};
