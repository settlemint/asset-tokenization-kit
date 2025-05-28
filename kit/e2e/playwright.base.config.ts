import type { PlaywrightTestConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const e2eDir = path.dirname(__filename);
const projectRoot = path.resolve(e2eDir, "../../");

dotenv.config({ path: path.join(projectRoot, ".env") });
dotenv.config({ path: path.join(projectRoot, ".env.local"), override: true });

const requiredEnvVars = [
  "SETTLEMINT_HASURA_DATABASE_URL",
  "SETTLEMINT_CUSTOM_DEPLOYMENT_ENDPOINT",
] as const;

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
    timeout: 65000,
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
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
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

  webServer: process.env.CI
    ? undefined
    : {
        command: "cd ../dapp && bun run dev",
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          PORT: "3000",
        },
      },
};

export default baseConfig;
