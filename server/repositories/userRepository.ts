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
  // @ts-expect-error drizzle types don't expose rowCount here
  return (res?.rowCount ?? 0) > 0
}
