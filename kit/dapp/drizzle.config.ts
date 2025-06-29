import { config } from "@dotenvx/dotenvx";
import { defineConfig } from "drizzle-kit";

// Load with Next.js convention: .env, .env.local (and .env.development, .env.development.local in dev)
config();

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/lib/db/schemas/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SETTLEMINT_HASURA_DATABASE_URL ?? "",
  },
});
