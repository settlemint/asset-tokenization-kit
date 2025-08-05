import type { PlaywrightTestConfig } from "@playwright/test";
import baseConfig from "./playwright.base.config";

const uiConfig: PlaywrightTestConfig = {
  ...baseConfig,
  testDir: "./ui-tests",
  use: {
    ...baseConfig.use,
    headless: true,
    launchOptions: {
      slowMo: 100,
    },
  },
  projects: [
    {
      name: "setup",
      testMatch: "**/complete-onboarding-flow.spec.ts",
      fullyParallel: false,
      teardown: "cleanup",
    },
    {
      name: "ui-tests",
      testMatch: "**/*.spec.ts",
      testIgnore: [
        "**/complete-onboarding-flow.spec.ts",
        "**/global-cleanup.spec.ts",
        "**/create-*.spec.ts",
        "**/xvp-settlement.spec.ts",
      ],
      fullyParallel: true,
      dependencies: ["setup"],
    },
    {
      name: "cleanup",
      testMatch: "**/global-cleanup.spec.ts",
      fullyParallel: false,
    },
  ],
};

export default uiConfig;
