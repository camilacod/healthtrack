import {
  getSchedulesForUserRepo,
  getScheduleForUserSupplementRepo,
  upsertScheduleRepo,
  deleteScheduleRepo,
  toggleScheduleActiveRepo,
  type ScheduleInput,
  type ScheduleWithDetails,
} from '../repositories/scheduleRepository'

export async function getSchedulesForUser(userId: string): Promise<Record<number, ScheduleWithDetails>> {
  return await getSchedulesForUserRepo(userId)
}

export async function getScheduleForSupplement(
  userId: string,
  supplementId: number
): Promise<ScheduleWithDetails | null> {
  return await getScheduleForUserSupplementRepo(userId, supplementId)
}

export async function saveSchedule(
  userId: string,
  supplementId: number,
  input: ScheduleInput
): Promise<ScheduleWithDetails> {
  // Validate input
  if (!input.days || input.days.length === 0) {
    throw new Error('At least one day must be selected')
  }
  if (!input.times || input.times.length === 0) {
    throw new Error('At least one time must be selected')
  }

  // Validate days are 0-6
  for (const day of input.days) {
    if (day < 0 || day > 6) {
      throw new Error('Invalid day of week')
    }
  }

  // Validate times format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  for (const timeEntry of input.times) {
    if (!timeRegex.test(timeEntry.time)) {
      throw new Error(`Invalid time format: ${timeEntry.time}`)
    }
  }

  return await upsertScheduleRepo(userId, supplementId, input)
}

export async function removeSchedule(userId: string, supplementId: number): Promise<boolean> {
  return await deleteScheduleRepo(userId, supplementId)
}

export async function toggleScheduleActive(
  userId: string,
  supplementId: number,
  isActive: boolean
): Promise<boolean> {
  return await toggleScheduleActiveRepo(userId, supplementId, isActive)
}

