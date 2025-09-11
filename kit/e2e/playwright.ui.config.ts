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
      name: "stablecoin-tests",
      testMatch: "**/create-stablecoin-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup"],
    },
    {
      name: "deposit-tests",
      testMatch: "**/create-deposit-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup"],
    },
    {
      name: "equity-tests",
      testMatch: "**/create-equity-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup"],
    },
    {
      name: "fund-tests",
      testMatch: "**/create-fund-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup"],
    },
    {
      name: "bond-tests",
      testMatch: "**/create-bond-validation.spec.ts",
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
