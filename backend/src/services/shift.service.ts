import { ShiftRepository } from '../repositories/shift.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { Errors } from '../utils/errors';
import type { MemberShift, MemberContract } from '../types/database.types';

export class ShiftService {
  /**
   * Records a punch-in event
   */
  static async punchIn(userId: string, restaurantId: string): Promise<MemberShift> {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) throw Errors.FORBIDDEN;

    const activeShift = await ShiftRepository.findActiveShift(membership.id);
    if (activeShift) throw Errors.CONFLICT('Already punched in');

    return await ShiftRepository.createShift({
      membership_id: membership.id,
      punch_in_at: new Date(),
      punch_out_at: null,
      total_minutes: null,
      notes: null,
    });
  }

  /**
   * Records a punch-out event
   */
  static async punchOut(userId: string, restaurantId: string, notes?: string): Promise<MemberShift> {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) throw Errors.FORBIDDEN;

    const activeShift = await ShiftRepository.findActiveShift(membership.id);
    if (!activeShift) throw Errors.NOT_FOUND('No active shift found');

    const punchOutAt = new Date();
    const totalMinutes = Math.floor(
      (punchOutAt.getTime() - activeShift.punch_in_at.getTime()) / (1000 * 60)
    );

    return await ShiftRepository.updateShift(activeShift.id, {
      punch_out_at: punchOutAt,
      total_minutes: totalMinutes,
      notes: notes || null,
    });
  }

  /**
   * Gets current status for a user
   */
  static async getCurrentStatus(userId: string, restaurantId: string) {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) throw Errors.FORBIDDEN;

    const activeShift = await ShiftRepository.findActiveShift(membership.id);
    return {
      isPunchedIn: !!activeShift,
      activeShift: activeShift || null,
    };
  }

  /**
   * Gets personal statistics for a member
   */
  static async getPersonalStats(userId: string, restaurantId: string, period: string) {
    const membership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!membership) throw Errors.FORBIDDEN;

    const { startDate, endDate } = this.getDateRange(period);
    const shifts = await ShiftRepository.findShiftsByMembership(membership.id, startDate, endDate);
    const contract = await ShiftRepository.findActiveContract(membership.id);

    const workedMinutes = shifts.reduce((acc, shift) => acc + (shift.total_minutes || 0), 0);
    const contractedMinutes = this.calculateContractedMinutes(contract, period);

    return {
      workedMinutes,
      contractedMinutes,
      differenceMinutes: workedMinutes - contractedMinutes,
      status: this.calculateStatus(workedMinutes, contractedMinutes),
      history: shifts,
    };
  }

  /**
   * Gets team statistics for all members (admin)
   */
  static async getTeamStats(restaurantId: string) {
    const { startDate, endDate } = this.getDateRange('weekly');
    const stats = await ShiftRepository.getMemberStats(restaurantId, startDate, endDate);

    return stats.map(member => {
      const worked = Number(member.total_worked_minutes);
      const contracted = (Number(member.weekly_hours) || 0) * 60;
      
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        totalWorkedThisWeek: worked,
        totalBankOfHours: worked - contracted,
        status: this.calculateStatus(worked, contracted),
      };
    });
  }

  // --- Helpers ---

  private static getDateRange(period: string) {
    const now = new Date();
    let startDate = new Date();
    const endDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'trimestral':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'semmestral':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'anual':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  }

  private static calculateContractedMinutes(contract: MemberContract | null, period: string): number {
    if (!contract) return 0;
    const weeklyMinutes = contract.weekly_hours * 60;

    switch (period) {
      case 'daily': return Math.round(weeklyMinutes / 7);
      case 'weekly': return weeklyMinutes;
      case 'monthly': return Math.round(weeklyMinutes * 4.33);
      case 'trimestral': return weeklyMinutes * 13;
      case 'semmestral': return weeklyMinutes * 26;
      case 'anual': return weeklyMinutes * 52;
      default: return 0;
    }
  }

  private static calculateStatus(worked: number, contracted: number) {
    const diff = worked - contracted;
    const diffHours = diff / 60;

    if (diffHours >= -2 && diffHours <= 2) return 'healthy';
    if ((diffHours > 2 && diffHours <= 10) || (diffHours < -2 && diffHours >= -10)) return 'caution';
    if (diffHours > 10 && diffHours <= 20) return 'overworked';
    return 'critical';
  }
}

