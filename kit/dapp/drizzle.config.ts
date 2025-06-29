import { config } from "@dotenvx/dotenvx";
import { defineConfig } from "drizzle-kit";

config({ path: [".env", ".env.local"] });

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/lib/db/schemas/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SETTLEMINT_HASURA_DATABASE_URL ?? "",
  },
});
