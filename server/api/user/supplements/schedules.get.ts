import { defineEventHandler } from 'h3'
import { requireUser } from '../../../utils/auth'
import { getSchedulesForUser } from '../../../services/scheduleService'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const schedules = await getSchedulesForUser(user.id)
  return schedules
})

