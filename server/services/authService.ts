import { createError } from 'h3'
import type { CreateUserInput, LoginInput } from '../domain/user'
import { createUserRepo, getUserByEmailRepo } from '../repositories/userRepository'
import { db } from '../utils/db'
import { admins, users } from '../db/schema'
import { eq, sql } from 'drizzle-orm'

export async function signup(input: CreateUserInput) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  }
  if (!input.password || input.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Contraseña mínima 8 caracteres' })
  }
  const exists = await getUserByEmailRepo(input.email)
  if (exists) throw createError({ statusCode: 409, statusMessage: 'Email ya registrado' })
  const user = await createUserRepo(input)
  return user
}

export async function login(input: LoginInput) {
  if (!input.email || !input.password) {
    throw createError({ statusCode: 400, statusMessage: 'Credenciales requeridas' })
  }
  // Validate via pgcrypto's crypt comparison on the DB
  const rows = await db.execute<{ id: string; email: string; username: string | null }>(
    sql`select id, email, username from ${users}
        where email = ${input.email}
          and password_hash is not null
          and password_hash = crypt(${input.password}, password_hash)`
  )
  const row = (rows as any)?.rows?.[0]
  if (!row) throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })
  const [adm] = await db.select().from(admins).where(eq(admins.userId, row.id))
  return { user: row, isAdmin: !!adm }
}

