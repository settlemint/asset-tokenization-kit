import { config as dotenvConfig } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ClientConfig } from "pg";
import postgres from "pg";
import { adminUser } from "../test-data/user-data";
const { Client } = postgres;

type UserRole = "admin" | "user";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../"
);

dotenvConfig({ path: path.join(projectRoot, ".env"), quiet: true });
dotenvConfig({
  path: path.join(projectRoot, ".env.local"),
  override: true,
  quiet: true,
});

const databaseUrl = process.env.SETTLEMINT_HASURA_DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "SETTLEMINT_HASURA_DATABASE_URL not found in environment variables"
  );
}

interface DatabaseConfig extends ClientConfig {
  connectionString: string;
}

function getDatabaseConfig(): DatabaseConfig {
  const connectionString = process.env.SETTLEMINT_HASURA_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Database connection string not found in environment variables"
    );
  }

  return { connectionString };
}

export async function createDbClient(): Promise<InstanceType<typeof Client>> {
  const config = getDatabaseConfig();
  const client = new Client(config);

  try {
    await client.connect();
    await client.query("SELECT 1");
    return client;
  } catch (error) {
    await client.end().catch(() => false);
    throw new Error(
      `Failed to connect to database: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function updateUserRole(
  email: string,
  role: UserRole
): Promise<void> {
  const client = await createDbClient();
  try {
    await client.query('UPDATE "user" SET role = $1 WHERE email = $2', [
      role,
      email,
    ]);
  } catch (error) {
    throw new Error(
      `Failed to update user role: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    await client.end();
  }
}

export async function getUserRole(email: string): Promise<UserRole | null> {
  const client = await createDbClient();
  try {
    const result = await client.query(
      'SELECT role FROM "user" WHERE email = $1',
      [email]
    );
    return result.rows.length ? (result.rows[0].role as UserRole) : null;
  } finally {
    await client.end();
  }
}

export async function fetchWalletAddressFromDB(email: string): Promise<string> {
  const client = await createDbClient();
  try {
    const result = await client.query(
      'SELECT wallet FROM "user" WHERE email = $1',
      [email]
    );

    if (!result.rows.length || !result.rows[0].wallet) {
      throw new Error(`No wallet address found for user with email: ${email}`);
    }

    return result.rows[0].wallet;
  } finally {
    await client.end();
  }
}

export async function isUserAdmin(
  email: string = adminUser.email
): Promise<boolean> {
  try {
    const role = await getUserRole(email);
    return role === "admin";
  } catch (error) {
    throw new Error(
      `Failed to check admin role: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function ensureUserIsAdmin(
  email: string = adminUser.email
): Promise<boolean> {
  try {
    const hasAdminRole = await isUserAdmin(email);

    if (!hasAdminRole) {
      await updateUserRole(email, "admin");
      return true;
    }

    return false;
  } catch (error) {
    throw new Error(
      `Failed to ensure admin role: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function getUserPincodeStatusFromDB(email: string): Promise<{
  pincodeEnabled: boolean;
  pincodeVerificationId: string | null;
} | null> {
  const client = await createDbClient();
  try {
    const result = await client.query(
      'SELECT pincode_enabled, pincode_verification_id FROM "user" WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const userData = result.rows[0];
    return {
      pincodeEnabled: userData.pincode_enabled ?? false,
      pincodeVerificationId: userData.pincode_verification_id ?? null,
    };
  } catch (error) {
    console.error(
      `[DB UTILS] Error fetching pincode status for ${email}:`,
      error instanceof Error ? error.message : String(error)
    );
    throw new Error(
      `Failed to get user pincode status: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    await client.end();
  }
}

export async function isPincodeEnabledInDB(email: string): Promise<boolean> {
  try {
    const status = await getUserPincodeStatusFromDB(email);
    if (!status) {
      return false;
    }
    const isEnabled = !!(
      status.pincodeEnabled &&
      status.pincodeVerificationId &&
      status.pincodeVerificationId.trim() !== ""
    );
    return isEnabled;
  } catch (error) {
    console.error(
      `[DB UTILS] Error in isPincodeEnabledInDB for ${email}:`,
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

export async function cleanupZeroAddressUsers(): Promise<void> {
  const client = await createDbClient();
  try {
    await client.query('DELETE FROM "user" WHERE wallet = $1', [
      "0x0000000000000000000000000000000000000000",
    ]);
  } catch (error) {
    throw new Error(
      `Failed to cleanup zero address users: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    await client.end();
  }
}
