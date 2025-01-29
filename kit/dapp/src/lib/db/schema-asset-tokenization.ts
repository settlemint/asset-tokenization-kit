import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { organization } from './schema-auth';

export const asset = pgTable('asset', {
  id: text('id').primaryKey(),
  private: boolean('private').default(false).notNull(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id),
});
