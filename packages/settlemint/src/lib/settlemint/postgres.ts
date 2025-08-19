import { SQL } from "bun";

const databaseUrl = process.env.SETTLEMINT_HASURA_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("SETTLEMINT_HASURA_DATABASE_URL environment variable is required");
}

export const client = new SQL({
  url: databaseUrl,

  // Connection pool settings (matching PostgreSQL pool configuration)
  max: 10, // Maximum connections in pool
  idleTimeout: 30, // Close idle connections after 30 seconds
  connectionTimeout: 5, // Timeout when establishing new connections (5 seconds)
  maxLifetime: 0, // Connection lifetime in seconds (0 = forever)
});
