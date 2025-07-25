import type { PlaywrightTestConfig } from "@playwright/test";
import baseConfig from "./playwright.base.config";

const uiConfig: PlaywrightTestConfig = {
  ...baseConfig,
  testDir: "./ui-tests",
  testIgnore: ["**/create-*.spec.ts", "**/xvp-settlement.spec.ts"],
  use: {
    ...baseConfig.use,
    headless: false,
    launchOptions: {
      slowMo: 100,
    },
  },
  projects: [
    {
      name: "ui-tests",
    },
  ],
};

export default uiConfig;
