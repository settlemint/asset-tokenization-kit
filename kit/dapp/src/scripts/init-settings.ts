#!/usr/bin/env bun
import { db } from "../lib/db";
import {
  DEFAULT_SETTINGS,
  SETTING_KEYS,
  settings,
} from "../lib/db/schema-settings";

/**
 * Initialize default settings in the database
 */
async function initSettings() {
  console.log("Initializing default settings...");

  // Add baseCurrency setting with default value (EUR)
  await db
    .insert(settings)
    .values({
      key: SETTING_KEYS.BASE_CURRENCY,
      value: DEFAULT_SETTINGS[SETTING_KEYS.BASE_CURRENCY],
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: DEFAULT_SETTINGS[SETTING_KEYS.BASE_CURRENCY] },
    });

  console.log("Settings initialized successfully!");
}

// Run the initialization script
initSettings()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error initializing settings:", error);
    process.exit(1);
  });
