import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env", ".env.local"], quiet: true });

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/lib/db/schemas/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SETTLEMINT_HASURA_DATABASE_URL ?? "",
  },
});
