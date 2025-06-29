import { config } from "@dotenvx/dotenvx";
import { defineConfig } from "drizzle-kit";

// Load .env and .env.local files
// Ignore missing files to match dotenv behavior
config({ 
  path: [".env", ".env.local"],
  ignore: ["MISSING_ENV_FILE"]
});

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/lib/db/schemas/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SETTLEMINT_HASURA_DATABASE_URL ?? "",
  },
});
