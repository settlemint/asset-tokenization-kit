import { pgTable, text } from 'drizzle-orm/pg-core';

export const asset = pgTable('asset', {
  id: text('id').primaryKey(),
  isin: text('isin'),
});
