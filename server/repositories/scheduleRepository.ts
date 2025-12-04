import { db } from '../utils/db'
import { supplementSchedules, scheduleDays, scheduleTimes, userSupplements } from '../db/schema'
import { sql, eq, and } from 'drizzle-orm'

export type ScheduleInput = {
  days: number[] // 0=Sunday, 6=Saturday
  times: { time: string; label?: string }[] // time in "HH:MM" format
}

export type ScheduleWithDetails = {
  id: number
  userSupplementId: number
  isActive: boolean
  days: number[]
  times: { time: string; label?: string }[]
}

/**
 * Get all schedules for a user's supplements
 */
export async function getSchedulesForUserRepo(userId: string): Promise<Record<number, ScheduleWithDetails>> {
  // Get user supplements with their schedules
  const rows = await db.execute(
    sql`SELECT 
          us.supplement_id,
          ss.id as schedule_id,
          ss.user_supplement_id,
          ss.is_active,
          COALESCE(
            (SELECT json_agg(sd.day_of_week ORDER BY sd.day_of_week) 
             FROM schedule_days sd WHERE sd.schedule_id = ss.id),
            '[]'
          ) as days,
          COALESCE(
            (SELECT json_agg(json_build_object('time', st.time_of_day::text, 'label', st.label) ORDER BY st.time_of_day) 
             FROM schedule_times st WHERE st.schedule_id = ss.id),
            '[]'
          ) as times
        FROM user_supplements us
        LEFT JOIN supplement_schedules ss ON ss.user_supplement_id = us.id
        WHERE us.user_id = ${userId}::uuid 
          AND us.relation = 'uses'
          AND ss.id IS NOT NULL`
  )

  const result: Record<number, ScheduleWithDetails> = {}
  for (const row of (rows as any)?.rows ?? []) {
    result[row.supplement_id] = {
      id: row.schedule_id,
      userSupplementId: row.user_supplement_id,
      isActive: row.is_active,
      days: row.days || [],
      times: (row.times || []).map((t: any) => ({
        time: t.time?.substring(0, 5) || t.time, // Remove seconds if present
        label: t.label,
      })),
    }
  }
  return result
}

/**
 * Get schedule for a specific user supplement
 */
export async function getScheduleForUserSupplementRepo(
  userId: string,
  supplementId: number
): Promise<ScheduleWithDetails | null> {
  const rows = await db.execute(
    sql`SELECT 
          ss.id as schedule_id,
          ss.user_supplement_id,
          ss.is_active,
          COALESCE(
            (SELECT json_agg(sd.day_of_week ORDER BY sd.day_of_week) 
             FROM schedule_days sd WHERE sd.schedule_id = ss.id),
            '[]'
          ) as days,
          COALESCE(
            (SELECT json_agg(json_build_object('time', st.time_of_day::text, 'label', st.label) ORDER BY st.time_of_day) 
             FROM schedule_times st WHERE st.schedule_id = ss.id),
            '[]'
          ) as times
        FROM user_supplements us
        JOIN supplement_schedules ss ON ss.user_supplement_id = us.id
        WHERE us.user_id = ${userId}::uuid 
          AND us.supplement_id = ${supplementId}::bigint
          AND us.relation = 'uses'`
  )

  const row = (rows as any)?.rows?.[0]
  if (!row) return null

  return {
    id: row.schedule_id,
    userSupplementId: row.user_supplement_id,
    isActive: row.is_active,
    days: row.days || [],
    times: (row.times || []).map((t: any) => ({
      time: t.time?.substring(0, 5) || t.time,
      label: t.label,
    })),
  }
}

/**
 * Create or update a schedule for a user supplement
 */
export async function upsertScheduleRepo(
  userId: string,
  supplementId: number,
  input: ScheduleInput
): Promise<ScheduleWithDetails> {
  // First, find the user_supplement_id
  const usRows = await db.execute(
    sql`SELECT id FROM user_supplements 
        WHERE user_id = ${userId}::uuid 
          AND supplement_id = ${supplementId}::bigint 
          AND relation = 'uses'`
  )
  const userSupplementId = (usRows as any)?.rows?.[0]?.id
  if (!userSupplementId) {
    throw new Error('User supplement not found')
  }

  // Check if schedule exists
  const existingRows = await db.execute(
    sql`SELECT id FROM supplement_schedules WHERE user_supplement_id = ${userSupplementId}::bigint`
  )
  const existingScheduleId = (existingRows as any)?.rows?.[0]?.id

  let scheduleId: number

  if (existingScheduleId) {
    // Update existing schedule
    scheduleId = existingScheduleId
    await db.execute(
      sql`UPDATE supplement_schedules SET updated_at = NOW() WHERE id = ${scheduleId}`
    )
    // Delete existing days and times
    await db.execute(sql`DELETE FROM schedule_days WHERE schedule_id = ${scheduleId}`)
    await db.execute(sql`DELETE FROM schedule_times WHERE schedule_id = ${scheduleId}`)
  } else {
    // Create new schedule
    const insertResult = await db.execute(
      sql`INSERT INTO supplement_schedules (user_supplement_id, is_active)
          VALUES (${userSupplementId}::bigint, true)
          RETURNING id`
    )
    scheduleId = (insertResult as any)?.rows?.[0]?.id
  }

  // Insert days
  for (const day of input.days) {
    await db.execute(
      sql`INSERT INTO schedule_days (schedule_id, day_of_week) 
          VALUES (${scheduleId}, ${day})
          ON CONFLICT (schedule_id, day_of_week) DO NOTHING`
    )
  }

  // Insert times
  for (const timeEntry of input.times) {
    await db.execute(
      sql`INSERT INTO schedule_times (schedule_id, time_of_day, label)
          VALUES (${scheduleId}, ${timeEntry.time}::time, ${timeEntry.label ?? null})
          ON CONFLICT (schedule_id, time_of_day) DO NOTHING`
    )
  }

  return {
    id: scheduleId,
    userSupplementId,
    isActive: true,
    days: input.days,
    times: input.times,
  }
}

/**
 * Delete a schedule
 */
export async function deleteScheduleRepo(userId: string, supplementId: number): Promise<boolean> {
  const result = await db.execute(
    sql`DELETE FROM supplement_schedules ss
        USING user_supplements us
        WHERE ss.user_supplement_id = us.id
          AND us.user_id = ${userId}::uuid
          AND us.supplement_id = ${supplementId}::bigint
          AND us.relation = 'uses'`
  )
  return (result as any)?.rowCount > 0
}

/**
 * Toggle schedule active status
 */
export async function toggleScheduleActiveRepo(
  userId: string,
  supplementId: number,
  isActive: boolean
): Promise<boolean> {
  const result = await db.execute(
    sql`UPDATE supplement_schedules ss
        SET is_active = ${isActive}, updated_at = NOW()
        FROM user_supplements us
        WHERE ss.user_supplement_id = us.id
          AND us.user_id = ${userId}::uuid
          AND us.supplement_id = ${supplementId}::bigint
          AND us.relation = 'uses'`
  )
  return (result as any)?.rowCount > 0
}

