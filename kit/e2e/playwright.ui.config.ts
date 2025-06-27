import type { PlaywrightTestConfig } from '@playwright/test';
import baseConfig from './playwright.base.config';

const uiConfig: PlaywrightTestConfig = {
  ...baseConfig,
  testDir: './ui-tests',

  use: {
    ...baseConfig.use,
    headless: false,
    launchOptions: {
      slowMo: 100,
    },
  },
  projects: [
    {
      name: 'ui-tests',
    },
  ],
};

export default uiConfig;
