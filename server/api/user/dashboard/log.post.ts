import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../../utils/auth'
import { markDoseTaken } from '../../../services/dashboardService'

type LogBody = {
  userSupplementId: number
  scheduledTime: string // HH:MM format
  date: string // YYYY-MM-DD format
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const body = await readBody<LogBody>(event)
  
  if (!body.userSupplementId || !body.scheduledTime || !body.date) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'userSupplementId, scheduledTime, and date are required' 
    })
  }

  try {
    const result = await markDoseTaken(
      user.id,
      body.userSupplementId,
      body.scheduledTime,
      body.date
    )
    return result
  } catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: e.message || 'Failed to log dose' })
  }
})

