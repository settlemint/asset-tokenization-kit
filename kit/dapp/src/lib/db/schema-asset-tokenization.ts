import { boolean, pgTable, text } from 'drizzle-orm/pg-core';

export const asset = pgTable('asset', {
  id: text('id').primaryKey(),
  private: boolean('private').default(false).notNull(),
});
