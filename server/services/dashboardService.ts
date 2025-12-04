import {
  getScheduledDosesForDayRepo,
  getUserStatsRepo,
  getWeeklyDataRepo,
  getWeeklyConsistencyRepo,
  logDoseTakenRepo,
  removeDoseLogRepo,
  getTodayStatsRepo,
  type ScheduledDose,
  type WeeklyDay,
} from '../repositories/dashboardRepository'

export type DashboardData = {
  stats: {
    taken: number
    total: number
    streak: number
    weeklyConsistency: number
  }
  weeklyData: WeeklyDay[]
  doses: ScheduledDose[]
}

/**
 * Get full dashboard data for a specific date
 */
export async function getDashboardData(userId: string, dateStr?: string): Promise<DashboardData> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  
  // Fetch all data in parallel
  const [doses, userStats, weeklyData, weeklyConsistency, todayStats] = await Promise.all([
    getScheduledDosesForDayRepo(userId, targetDate),
    getUserStatsRepo(userId),
    getWeeklyDataRepo(userId),
    getWeeklyConsistencyRepo(userId),
    getTodayStatsRepo(userId, targetDate),
  ])

  return {
    stats: {
      taken: todayStats.taken,
      total: todayStats.total,
      streak: userStats.currentStreak,
      weeklyConsistency,
    },
    weeklyData,
    doses,
  }
}

/**
 * Get scheduled doses for a specific date
 */
export async function getDosesForDate(userId: string, dateStr: string): Promise<ScheduledDose[]> {
  return await getScheduledDosesForDayRepo(userId, dateStr)
}

/**
 * Mark a dose as taken
 */
export async function markDoseTaken(
  userId: string,
  userSupplementId: number,
  scheduledTime: string,
  dateStr: string
): Promise<{ logId: number; takenAt: string }> {
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(scheduledTime)) {
    throw new Error('Invalid time format')
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateStr)) {
    throw new Error('Invalid date format')
  }

  return await logDoseTakenRepo(userId, userSupplementId, scheduledTime, dateStr)
}

/**
 * Unmark a dose (remove log)
 */
export async function unmarkDose(userId: string, logId: number): Promise<boolean> {
  return await removeDoseLogRepo(userId, logId)
}

/**
 * Get weekly chart data
 */
export async function getWeeklyChartData(userId: string): Promise<WeeklyDay[]> {
  return await getWeeklyDataRepo(userId)
}

/**
 * Get user stats summary
 */
export async function getUserStats(userId: string): Promise<{
  currentStreak: number
  longestStreak: number
  weeklyConsistency: number
}> {
  const [stats, consistency] = await Promise.all([
    getUserStatsRepo(userId),
    getWeeklyConsistencyRepo(userId),
  ])

  return {
    ...stats,
    weeklyConsistency: consistency,
  }
}

