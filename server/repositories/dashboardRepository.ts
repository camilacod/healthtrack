import { db } from '../utils/db'
import { sql } from 'drizzle-orm'

export type ScheduledDose = {
  id: string
  userSupplementId: number
  supplementId: number
  supplementName: string
  supplementBrand: string | null
  scheduledTime: string
  timeLabel: 'morning' | 'afternoon' | 'evening' | 'bedtime'
  taken: boolean
  takenAt: string | null
  logId: number | null
}

export type DailyStats = {
  taken: number
  total: number
  streak: number
  weeklyConsistency: number
}

export type WeeklyDay = {
  day: string
  date: string
  taken: number
  total: number
}

/**
 * Get time label based on hour
 */
function getTimeLabel(hour: number): 'morning' | 'afternoon' | 'evening' | 'bedtime' {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'bedtime'
}

/**
 * Get scheduled doses for a specific day
 */
export async function getScheduledDosesForDayRepo(
  userId: string,
  dateStr: string // YYYY-MM-DD format
): Promise<ScheduledDose[]> {
  // Get day of week from date (0=Sunday, 6=Saturday)
  const targetDate = new Date(dateStr + 'T00:00:00')
  const dayOfWeek = targetDate.getDay()

  const rows = await db.execute(
    sql`SELECT DISTINCT ON (us.id, st.time_of_day)
          CONCAT(us.id, '-', st.time_of_day::text) as id,
          us.id as user_supplement_id,
          s.id as supplement_id,
          s.name as supplement_name,
          s.brand as supplement_brand,
          st.time_of_day::text as scheduled_time,
          sl.id as log_id,
          sl.taken_at,
          sl.skipped
        FROM user_supplements us
        JOIN supplements s ON s.id = us.supplement_id
        JOIN supplement_schedules ss ON ss.user_supplement_id = us.id
        JOIN schedule_days sd ON sd.schedule_id = ss.id
        JOIN schedule_times st ON st.schedule_id = ss.id
        LEFT JOIN supplement_logs sl ON 
          sl.user_supplement_id = us.id 
          AND sl.scheduled_time = st.time_of_day
          AND sl.taken_at::date = ${dateStr}::date
          AND sl.skipped = false
        WHERE us.user_id = ${userId}::uuid
          AND us.relation = 'uses'
          AND ss.is_active = true
          AND sd.day_of_week = ${dayOfWeek}
        ORDER BY us.id, st.time_of_day, sl.taken_at DESC NULLS LAST`
  )

  return ((rows as any)?.rows ?? []).map((row: any) => {
    const timeStr = row.scheduled_time?.substring(0, 5) || '08:00'
    const hour = parseInt(timeStr.split(':')[0])
    
    return {
      id: row.id,
      userSupplementId: row.user_supplement_id,
      supplementId: row.supplement_id,
      supplementName: row.supplement_name,
      supplementBrand: row.supplement_brand,
      scheduledTime: timeStr,
      timeLabel: getTimeLabel(hour),
      taken: row.log_id !== null && !row.skipped,
      takenAt: row.taken_at ? new Date(row.taken_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null,
      logId: row.log_id,
    }
  })
}

/**
 * Get user stats (streak, etc.)
 */
export async function getUserStatsRepo(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const rows = await db.execute(
    sql`SELECT current_streak, longest_streak
        FROM user_stats
        WHERE user_id = ${userId}::uuid`
  )
  
  const row = (rows as any)?.rows?.[0]
  if (!row) {
    return { currentStreak: 0, longestStreak: 0 }
  }
  
  return {
    currentStreak: row.current_streak || 0,
    longestStreak: row.longest_streak || 0,
  }
}

/**
 * Get weekly data for the chart
 */
export async function getWeeklyDataRepo(userId: string): Promise<WeeklyDay[]> {
  const today = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const result: WeeklyDay[] = []

  // Get data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()

    // Get scheduled count for this day
    const scheduledRows = await db.execute(
      sql`SELECT COUNT(DISTINCT CONCAT(us.id, '-', st.time_of_day)) as total
          FROM user_supplements us
          JOIN supplement_schedules ss ON ss.user_supplement_id = us.id
          JOIN schedule_days sd ON sd.schedule_id = ss.id
          JOIN schedule_times st ON st.schedule_id = ss.id
          WHERE us.user_id = ${userId}::uuid
            AND us.relation = 'uses'
            AND ss.is_active = true
            AND sd.day_of_week = ${dayOfWeek}`
    )

    // Get taken count for this day
    const takenRows = await db.execute(
      sql`SELECT COUNT(*) as taken
          FROM supplement_logs sl
          JOIN user_supplements us ON us.id = sl.user_supplement_id
          WHERE us.user_id = ${userId}::uuid
            AND sl.taken_at::date = ${dateStr}::date
            AND sl.skipped = false`
    )

    const total = Number((scheduledRows as any)?.rows?.[0]?.total) || 0
    const taken = Number((takenRows as any)?.rows?.[0]?.taken) || 0

    result.push({
      day: dayNames[dayOfWeek],
      date: dateStr,
      taken: Math.min(taken, total), // Can't take more than scheduled
      total,
    })
  }

  return result
}

/**
 * Calculate weekly consistency percentage
 * A day counts as "consistent" if at least one supplement was taken
 */
export async function getWeeklyConsistencyRepo(userId: string): Promise<number> {
  const weeklyData = await getWeeklyDataRepo(userId)
  
  let daysWithSchedule = 0
  let daysWithAtLeastOneTaken = 0
  
  for (const day of weeklyData) {
    if (day.total > 0) {
      daysWithSchedule++
      if (day.taken > 0) {
        daysWithAtLeastOneTaken++
      }
    }
  }
  
  if (daysWithSchedule === 0) return 0
  return Math.round((daysWithAtLeastOneTaken / daysWithSchedule) * 100)
}

/**
 * Log a dose as taken
 */
export async function logDoseTakenRepo(
  userId: string,
  userSupplementId: number,
  scheduledTime: string, // HH:MM format
  dateStr: string // YYYY-MM-DD format
): Promise<{ logId: number; takenAt: string }> {
  // Verify ownership
  const ownerCheck = await db.execute(
    sql`SELECT id FROM user_supplements 
        WHERE id = ${userSupplementId}::bigint 
          AND user_id = ${userId}::uuid`
  )
  
  if (!((ownerCheck as any)?.rows?.length)) {
    throw new Error('Supplement not found')
  }

  // Check if already logged for this time slot today
  const existingLog = await db.execute(
    sql`SELECT id, taken_at FROM supplement_logs 
        WHERE user_supplement_id = ${userSupplementId}::bigint
          AND scheduled_time = ${scheduledTime}::time
          AND taken_at::date = ${dateStr}::date
          AND skipped = false`
  )

  const existing = (existingLog as any)?.rows?.[0]
  if (existing) {
    // Return existing log instead of creating duplicate
    return {
      logId: existing.id,
      takenAt: new Date(existing.taken_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }
  }

  // Insert new log entry
  const now = new Date()
  const result = await db.execute(
    sql`INSERT INTO supplement_logs (user_supplement_id, taken_at, scheduled_time, skipped)
        VALUES (${userSupplementId}::bigint, ${now.toISOString()}::timestamptz, ${scheduledTime}::time, false)
        RETURNING id, taken_at`
  )

  const row = (result as any)?.rows?.[0]
  
  // Update streak
  await updateStreakRepo(userId)
  
  return {
    logId: row.id,
    takenAt: new Date(row.taken_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

/**
 * Remove a dose log (unmark as taken)
 */
export async function removeDoseLogRepo(
  userId: string,
  logId: number
): Promise<boolean> {
  const result = await db.execute(
    sql`DELETE FROM supplement_logs sl
        USING user_supplements us
        WHERE sl.id = ${logId}
          AND sl.user_supplement_id = us.id
          AND us.user_id = ${userId}::uuid`
  )
  
  // Update streak
  await updateStreakRepo(userId)
  
  return (result as any)?.rowCount > 0
}

/**
 * Update user streak based on recent activity
 */
async function updateStreakRepo(userId: string): Promise<void> {
  // Calculate current streak by checking consecutive days with 100% completion
  const today = new Date()
  let streak = 0
  
  for (let i = 0; i < 365; i++) { // Check up to a year back
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    const dayOfWeek = checkDate.getDay()

    // Get scheduled count for this day
    const scheduledRows = await db.execute(
      sql`SELECT COUNT(DISTINCT CONCAT(us.id, '-', st.time_of_day)) as total
          FROM user_supplements us
          JOIN supplement_schedules ss ON ss.user_supplement_id = us.id
          JOIN schedule_days sd ON sd.schedule_id = ss.id
          JOIN schedule_times st ON st.schedule_id = ss.id
          WHERE us.user_id = ${userId}::uuid
            AND us.relation = 'uses'
            AND ss.is_active = true
            AND sd.day_of_week = ${dayOfWeek}`
    )

    const total = Number((scheduledRows as any)?.rows?.[0]?.total) || 0
    
    // If no supplements scheduled, skip this day (doesn't break streak)
    if (total === 0) continue

    // Get taken count for this day
    const takenRows = await db.execute(
      sql`SELECT COUNT(*) as taken
          FROM supplement_logs sl
          JOIN user_supplements us ON us.id = sl.user_supplement_id
          WHERE us.user_id = ${userId}::uuid
            AND sl.taken_at::date = ${dateStr}::date
            AND sl.skipped = false`
    )

    const taken = Number((takenRows as any)?.rows?.[0]?.taken) || 0
    
    // Check if all scheduled doses were taken
    if (taken >= total) {
      streak++
    } else {
      // For today, partial completion doesn't break streak
      if (i === 0) continue
      break
    }
  }

  // Upsert user stats - check if exists first
  const existingStats = await db.execute(
    sql`SELECT id, longest_streak FROM user_stats WHERE user_id = ${userId}::uuid`
  )
  
  const existing = (existingStats as any)?.rows?.[0]
  
  if (existing) {
    // Update existing record
    const newLongest = Math.max(existing.longest_streak || 0, streak)
    await db.execute(
      sql`UPDATE user_stats 
          SET current_streak = ${streak}, 
              longest_streak = ${newLongest}, 
              updated_at = NOW()
          WHERE user_id = ${userId}::uuid`
    )
  } else {
    // Insert new record
    await db.execute(
      sql`INSERT INTO user_stats (user_id, current_streak, longest_streak, updated_at)
          VALUES (${userId}::uuid, ${streak}, ${streak}, NOW())`
    )
  }
}

/**
 * Get today's stats summary
 */
export async function getTodayStatsRepo(userId: string, dateStr: string): Promise<{ taken: number; total: number }> {
  const doses = await getScheduledDosesForDayRepo(userId, dateStr)
  const total = doses.length
  const taken = doses.filter(d => d.taken).length
  
  return { taken, total }
}

