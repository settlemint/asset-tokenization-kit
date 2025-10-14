import type { PlaywrightTestConfig } from "@playwright/test";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const e2eDir = path.dirname(__filename);
const projectRoot = path.resolve(e2eDir, "../../");
const envFiles = [".env", ".env.local"] as const;

if (typeof process.loadEnvFile === "function") {
  for (const file of envFiles) {
    const filePath = path.join(projectRoot, file);
    try {
      process.loadEnvFile(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

const requiredEnvVars = ["SETTLEMINT_HASURA_DATABASE_URL"] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `[Base Config] Missing required environment variable: ${envVar}`
    );
  }
}

const baseConfig: PlaywrightTestConfig = {
  timeout: 600 * 1000,
  expect: {
    timeout: 120000,
  },
  retries: process.env.CI ? 2 : 0,
  fullyParallel: !process.env.CI,
  workers: process.env.CI ? 3 : undefined,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [["blob"], ["github"], ["html"]]
    : [["list"], ["html"]],

  use: {
    actionTimeout: 65000,
    navigationTimeout: 120000,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000/",
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    viewport: { width: 1920, height: 1080 },
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
    headless: !!process.env.CI || process.env.HEADLESS === "true",
    launchOptions: {
      slowMo: Number(process.env.PLAYWRIGHT_SLOW_MO) || 0,
      args: [
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-web-security",
      ],
    },
  },
};

export default baseConfig;
