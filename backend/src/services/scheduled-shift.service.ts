import { ScheduledShiftRepository } from '../repositories/scheduled-shift.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { Errors } from '../utils/errors';
import type { NewScheduledShift, ScheduledShiftUpdate } from '../types/database.types';

export class ScheduledShiftService {
  static async createShift(userId: string, restaurantId: string, data: Omit<NewScheduledShift, 'created_at' | 'updated_at'>) {
    // Check if membership exists and if the user is root/admin (already checked in handler, but good to be sure)
    const requesterMembership = await MembershipRepository.findByUserAndRestaurant(userId, restaurantId);
    if (!requesterMembership) throw Errors.FORBIDDEN;

    // Check if target membership exists in the same restaurant
    const targetMembership = await MembershipRepository.findById(data.membership_id);
    if (!targetMembership || targetMembership.restaurant_id !== restaurantId) {
      throw Errors.NOT_FOUND('Target member not found');
    }

    return await ScheduledShiftRepository.create(data as NewScheduledShift);
  }

  static async updateShift(userId: string, restaurantId: string, id: string, data: ScheduledShiftUpdate) {
    const shift = await ScheduledShiftRepository.findById(id);
    if (!shift) throw Errors.NOT_FOUND('Scheduled shift not found');

    const targetMembership = await MembershipRepository.findById(shift.membership_id);
    if (!targetMembership || targetMembership.restaurant_id !== restaurantId) {
      throw Errors.FORBIDDEN;
    }

    return await ScheduledShiftRepository.update(id, data);
  }

  static async deleteShift(userId: string, restaurantId: string, id: string) {
    const shift = await ScheduledShiftRepository.findById(id);
    if (!shift) throw Errors.NOT_FOUND('Scheduled shift not found');

    const targetMembership = await MembershipRepository.findById(shift.membership_id);
    if (!targetMembership || targetMembership.restaurant_id !== restaurantId) {
      throw Errors.FORBIDDEN;
    }

    await ScheduledShiftRepository.delete(id);
  }

  static async getShifts(restaurantId: string, startDate: Date, endDate: Date) {
    return await ScheduledShiftRepository.findByRestaurant(restaurantId, startDate, endDate);
  }

  static async getMemberShifts(membershipId: string, startDate: Date, endDate: Date) {
    return await ScheduledShiftRepository.findByMembership(membershipId, startDate, endDate);
  }
}
