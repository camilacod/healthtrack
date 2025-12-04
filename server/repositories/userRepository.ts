import { eq, sql } from 'drizzle-orm'
import { db } from '../utils/db'
import { users, type User } from '../db/schema'
import type { CreateUserInput, UpdateUserInput } from '../domain/user'

export async function createUserRepo(input: CreateUserInput): Promise<User> {
  const [row] = await db
    .insert(users)
    .values({
      email: input.email,
      username: input.username ?? null,
      passwordHash: sql`crypt(${input.password}, gen_salt('bf', 12))`,
    })
    .returning()
  return row
}

export async function getUserByIdRepo(id: string): Promise<User | undefined> {
  const [row] = await db.select().from(users).where(eq(users.id, id))
  return row
}

export async function getUserByEmailRepo(email: string): Promise<User | undefined> {
  const [row] = await db.select().from(users).where(eq(users.email, email))
  return row
}

export async function listUsersRepo(): Promise<User[]> {
  return await db.select().from(users).orderBy(users.createdAt)
}

export async function updateUserRepo(id: string, input: UpdateUserInput): Promise<User | undefined> {
  const [row] = await db
    .update(users)
    .set({ ...input })
    .where(eq(users.id, id))
    .returning()
  return row
}

export async function deleteUserRepo(id: string): Promise<boolean> {
  const res = await db.delete(users).where(eq(users.id, id))
  return (res?.rowCount ?? 0) > 0
}

export async function verifyPasswordRepo(userId: string, password: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT id FROM users 
        WHERE id = ${userId}::uuid 
        AND password_hash = crypt(${password}, password_hash)`
  )
  return ((result as any)?.rows?.length ?? 0) > 0
}

export async function updatePasswordRepo(userId: string, newPassword: string): Promise<boolean> {
  const result = await db.execute(
    sql`UPDATE users 
        SET password_hash = crypt(${newPassword}, gen_salt('bf', 12))
        WHERE id = ${userId}::uuid`
  )
  return ((result as any)?.rowCount ?? 0) > 0
}

export async function updateProfileRepo(
  userId: string, 
  input: { email?: string; username?: string | null }
): Promise<User | undefined> {
  const updates: any = {}
  if (input.email !== undefined) updates.email = input.email
  if (input.username !== undefined) updates.username = input.username
  
  if (Object.keys(updates).length === 0) {
    return await getUserByIdRepo(userId)
  }
  
  const [row] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning()
  return row
}
