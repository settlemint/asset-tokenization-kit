import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export interface SetupUser {
  email: string;
  password: string;
  pinCode: string;
  fullName: string;
  createdAt: string;
}

export function getSetupUser(): SetupUser {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const setupDataPath = path.join(__dirname, "../test-data/setup-user.json");

  if (!fs.existsSync(setupDataPath)) {
    throw new Error(
      "Setup user data not found. Make sure the onboarding setup test has run successfully."
    );
  }

  const data = fs.readFileSync(setupDataPath, "utf8");
  return JSON.parse(data) as SetupUser;
}
