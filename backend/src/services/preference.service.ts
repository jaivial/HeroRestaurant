import { PreferenceRepository } from '../repositories/preference.repository';
import type { UserPreference } from '../types/database.types';

export class PreferenceService {
  static async getAll(userId: string, workspaceId: string): Promise<Record<string, any>> {
    const prefs = await PreferenceRepository.findByUserAndWorkspace(userId, workspaceId);
    
    return prefs.reduce((acc, pref) => {
      try {
        acc[pref.preference_key] = JSON.parse(pref.preference_value);
      } catch (e) {
        acc[pref.preference_key] = pref.preference_value;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  static async set(userId: string, workspaceId: string, key: string, value: any): Promise<UserPreference> {
    const stringValue = JSON.stringify(value);
    return await PreferenceRepository.upsert(userId, workspaceId, key, stringValue);
  }
}
