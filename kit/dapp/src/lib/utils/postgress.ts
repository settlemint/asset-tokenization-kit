import { type SQL, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

// custom lower function
// See https://orm.drizzle.team/docs/guides/unique-case-insensitive-email
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}
