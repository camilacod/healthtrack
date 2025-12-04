import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { db } from '../../../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  // Align sequences with current max(id) for serial/identity columns
  await db.execute(sql`
    do $$ begin
      begin
        perform setval(pg_get_serial_sequence('public.supplements','id'), coalesce((select max(id) from public.supplements), 0), true);
      exception when others then null; end;

      begin
        perform setval(pg_get_serial_sequence('public.user_supplements','id'), coalesce((select max(id) from public.user_supplements), 0), true);
      exception when others then null; end;
    end $$;
  `)
  return { ok: true }
})

