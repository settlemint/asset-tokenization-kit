import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

config({ 
  path: [
    path.join(projectRoot, ".env"),
    path.join(projectRoot, ".env.local")
  ], 
  quiet: true 
});

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/lib/db/schemas/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SETTLEMINT_HASURA_DATABASE_URL ?? "",
  },
});
