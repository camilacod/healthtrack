import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { recognizeSupplementFromImage } from '../../services/visionService'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)

  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: 'Expected multipart/form-data' })

  const file = form.find((p) => p.name === 'image' && p.type && p.filename)
  if (!file || !file.data) throw createError({ statusCode: 400, statusMessage: 'Missing image file' })

  const base64 = Buffer.from(file.data).toString('base64')
  const result = await recognizeSupplementFromImage(user.id, base64)
  return result
})

