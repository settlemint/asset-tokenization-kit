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
      retries: 0,
    },
    {
      name: "transfer-users",
      testMatch: "**/create-transfer-user.spec.ts",
      fullyParallel: false,
      dependencies: ["setup"],
      retries: 0,
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
      dependencies: ["setup", "transfer-users"],
      retries: 2,
    },
    {
      name: "stablecoin-tests",
      testMatch: "**/create-stablecoin-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup", "transfer-users"],
      retries: 2,
    },
    {
      name: "deposit-tests",
      testMatch: "**/create-deposit-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup", "transfer-users"],
      retries: 2,
    },
    {
      name: "equity-tests",
      testMatch: "**/create-equity-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup", "transfer-users"],
      retries: 2,
    },
    {
      name: "fund-tests",
      testMatch: "**/create-fund-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup", "transfer-users"],
      retries: 0,
    },
    {
      name: "bond-tests",
      testMatch: "**/create-bond-validation.spec.ts",
      fullyParallel: true,
      dependencies: ["setup", "transfer-users"],
      retries: 2,
    },
    {
      name: "cleanup",
      testMatch: "**/global-cleanup.spec.ts",
      fullyParallel: false,
      retries: 0,
    },
  ],
};

export default uiConfig;
