import { eq } from 'drizzle-orm'
import { db } from '../utils/db'
import { admins, type Admin } from '../db/schema'
import type { CreateAdminInput } from '../domain/admin'

export async function createAdminRepo(input: CreateAdminInput): Promise<Admin> {
  const [row] = await db.insert(admins).values({ userId: input.userId }).returning()
  return row
}

export async function listAdminsRepo(): Promise<Admin[]> {
  return await db.select().from(admins).orderBy(admins.createdAt)
}

export async function deleteAdminRepo(userId: string): Promise<boolean> {
  const res = await db.delete(admins).where(eq(admins.userId, userId))
  // @ts-expect-error drizzle types don't expose rowCount here
  return (res?.rowCount ?? 0) > 0
}
