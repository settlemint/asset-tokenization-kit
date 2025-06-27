import type { PlaywrightTestConfig } from '@playwright/test';
import baseConfig from './playwright.base.config';

const apiConfig: PlaywrightTestConfig = {
  ...baseConfig,
  testDir: './api-tests',
  globalSetup: './api-global-setup.ts',
  globalTeardown: './api-global-teardown.ts',

  use: {
    ...baseConfig.use,
  },

  projects: [
    {
      name: 'api-tests',
    },
  ],
};

export default apiConfig;
