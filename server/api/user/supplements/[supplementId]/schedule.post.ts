import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { requireUser } from '../../../../utils/auth'
import { saveSchedule } from '../../../../services/scheduleService'

type ScheduleBody = {
  days: number[]
  times: { time: string; label?: string }[]
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const supplementId = Number(getRouterParam(event, 'supplementId'))
  
  if (isNaN(supplementId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid supplement ID' })
  }

  const body = await readBody<ScheduleBody>(event)
  
  if (!body.days || !Array.isArray(body.days)) {
    throw createError({ statusCode: 400, statusMessage: 'Days must be an array' })
  }
  if (!body.times || !Array.isArray(body.times)) {
    throw createError({ statusCode: 400, statusMessage: 'Times must be an array' })
  }

  try {
    const schedule = await saveSchedule(user.id, supplementId, body)
    return schedule
  } catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: e.message || 'Failed to save schedule' })
  }
})

