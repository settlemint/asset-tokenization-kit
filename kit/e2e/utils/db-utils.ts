import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import type { ClientConfig } from 'pg';
import postgres from 'pg';
const { Client } = postgres;

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
dotenvConfig({ path: path.join(projectRoot, '.env') });
dotenvConfig({ path: path.join(projectRoot, '.env.local'), override: true });

export type UserRole = 'admin' | 'user';

interface DatabaseConfig extends ClientConfig {
  connectionString: string;
}

function getDatabaseConfig(): DatabaseConfig {
  const connectionString = process.env.SETTLEMINT_HASURA_DATABASE_URL;

  if (!connectionString) {
    throw new Error('Database connection string not found in environment variables');
  }

  return { connectionString };
}

export async function createDbClient(): Promise<postgres.Client> {
  const config = getDatabaseConfig();
  const client = new Client(config);

  try {
    await client.connect();
    await client.query('SELECT 1');
    return client;
  } catch (error) {
    await client.end().catch(() => false);
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateUserRole(email: string, role: UserRole): Promise<void> {
  const client = new Client(getDatabaseConfig());

  try {
    await client.connect();
    await client.query('UPDATE "user" SET role = $1 WHERE email = $2', [role, email]);
  } catch (error) {
    throw new Error(`Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await client.end();
  }
}

export async function getUserRole(email: string): Promise<string> {
  const client = await createDbClient();
  try {
    const result = await client.query('SELECT role FROM "user" WHERE email = $1', [email]);
    return result.rows[0].role;
  } finally {
    await client.end();
  }
}
