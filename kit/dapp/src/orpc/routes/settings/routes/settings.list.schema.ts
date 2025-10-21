import { PaginatedListSchema } from "@/orpc/routes/common/schemas/paginated-list.schema";
import { SettingSchema } from "./settings.read.schema";

/**
 * Schema for listing settings.
 *
 * Extends the base ListSchema but overrides the default orderBy
 * to maintain backwards compatibility. Settings are typically ordered
 * by key for easier navigation.
 */
export const SettingsListSchema = PaginatedListSchema.extend({
  orderBy: PaginatedListSchema.shape.orderBy.default("key"),
});

/**
 * Output schema for listing settings.
 *
 * Returns an array of setting records.
 */
export const SettingsListOutputSchema = SettingSchema.array();
