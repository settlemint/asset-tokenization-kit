import { del } from "@/orpc/routes/contacts/routes/contacts.delete";
import { list } from "@/orpc/routes/contacts/routes/contacts.list";
import { search } from "@/orpc/routes/contacts/routes/contacts.search";
import { upsert } from "@/orpc/routes/contacts/routes/contacts.upsert";

/**
 * Contacts router module.
 *
 * Aggregates address book procedures used across participant workflows.
 */
const routes = {
  list,
  upsert,
  delete: del,
  search,
};

export default routes;
