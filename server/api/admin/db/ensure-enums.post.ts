import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { db } from '../../../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await db.execute(sql`
    do $$ begin
      begin
        alter type supplement_status add value if not exists 'pending';
      exception when others then null; end;
      begin
        alter type user_supp_relation add value if not exists 'submitted';
      exception when others then null; end;
    end $$;
  `)
  return { ok: true }
})

