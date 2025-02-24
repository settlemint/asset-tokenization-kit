import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import * as dotenv from 'dotenv';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');

dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const requiredEnvVars = ['SETTLEMINT_HASURA_DATABASE_URL', 'SETTLEMINT_CUSTOM_DEPLOYMENT_ENDPOINT'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 600 * 1000,
  expect: {
    timeout: 65000,
  },
  retries: 2,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: [['html']],
  use: {
    actionTimeout: 65000,
    navigationTimeout: 30000,
    baseURL: process.env.SETTLEMINT_CUSTOM_DEPLOYMENT_ENDPOINT,
    trace: 'off',
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    launchOptions: {
      slowMo: 100,
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-web-security',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'cd ../dapp && bun run dev',
        port: 3000,
        reuseExistingServer: true,
        timeout: 120000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
};

console.log('\n🌐 Playwright baseURL:', config?.use?.baseURL);
console.log('🔧 Running in CI:', !!process.env.CI, '\n');

export default config;
