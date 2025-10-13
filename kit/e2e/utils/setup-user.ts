import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export interface SetupUser {
  email: string;
  password: string;
  pincode: string;
  name: string;
  roles?: string[];
}

export function getSetupUserPath(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(__dirname, "../test-data/setup-user.json");
}

let cachedSetupUser: SetupUser | null = null;

export function getSetupUser(): SetupUser {
  if (cachedSetupUser) {
    return cachedSetupUser;
  }

  const setupDataPath = getSetupUserPath();
  if (!fs.existsSync(setupDataPath)) {
    throw new Error(
      "Setup user data not found. Make sure the onboarding setup test has run successfully."
    );
  }

  const data = fs.readFileSync(setupDataPath, "utf8");
  const user = JSON.parse(data) as SetupUser;
  cachedSetupUser = user;
  return user;
}

export function saveSetupUser(user: SetupUser): void {
  const setupDataPath = getSetupUserPath();
  const setupDir = path.dirname(setupDataPath);

  if (!fs.existsSync(setupDir)) {
    fs.mkdirSync(setupDir, { recursive: true });
  }

  fs.writeFileSync(setupDataPath, JSON.stringify(user, null, 2));
  cachedSetupUser = user;
}
