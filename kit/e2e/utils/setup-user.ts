import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export interface UserRecord {
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

type SetupUserStore = Record<string, UserRecord>;

const emptyStore = (): SetupUserStore => ({});

let cachedSetupUsers: SetupUserStore | null = null;

export function getSetupUser(key: string = "admin"): UserRecord {
  const users = loadSetupUsers();
  const record = users[key];

  if (!record) {
    throw new Error(`Setup user data not found for key "${key}".`);
  }

  return record;
}

function loadSetupUsers(): SetupUserStore {
  if (cachedSetupUsers) {
    return cachedSetupUsers;
  }

  const setupDataPath = getSetupUserPath();
  if (!fs.existsSync(setupDataPath)) {
    const store = emptyStore();
    cachedSetupUsers = store;
    return store;
  }

  const data = fs.readFileSync(setupDataPath, "utf8");
  const users = JSON.parse(data) as SetupUserStore;
  cachedSetupUsers = users;
  return users;
}

export function saveSetupUser(key: string, user: UserRecord): void {
  const setupDataPath = getSetupUserPath();
  const setupDir = path.dirname(setupDataPath);

  if (!fs.existsSync(setupDir)) {
    fs.mkdirSync(setupDir, { recursive: true });
  }

  let users: SetupUserStore;
  try {
    users = loadSetupUsers();
  } catch {
    users = emptyStore();
  }

  const next: SetupUserStore = { ...users, [key]: user };

  fs.writeFileSync(setupDataPath, JSON.stringify(next, null, 2));
  cachedSetupUsers = next;
}
