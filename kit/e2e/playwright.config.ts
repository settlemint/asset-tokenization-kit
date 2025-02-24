import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
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

const config: PlaywrightTestConfig = defineConfig({
  testDir: './tests',
  timeout: 600 * 1000,
  expect: {
    timeout: 65000,
  },
  retries: 2,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 3 : undefined,
  reporter: [['html'], ['list']],
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
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.spec.ts',
      testIgnore: [],
    },
  ],
  fullyParallel: false,
  shard: process.env.CI
    ? {
        current: Number(process.env.TEST_SHARD_CURRENT ?? 1),
        total: 3,
      }
    : undefined,
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
});

if (process.env.CI) {
  console.log('\n=== Test Configuration ===');
  console.log('Current Shard:', config.shard?.current);
  console.log('Total Shards:', config.shard?.total);
  console.log('Worker Count:', config.workers);
  console.log('Parallel Execution:', config.fullyParallel);
  console.log('========================\n');
}

console.log('\n🌐 Playwright baseURL:', config?.use?.baseURL);
console.log('🔧 Running in CI:', !!process.env.CI, '\n');

export default config;
