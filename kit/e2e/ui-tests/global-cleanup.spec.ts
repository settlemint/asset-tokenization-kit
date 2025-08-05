import { test } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

test("cleanup setup data", async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const setupDataPath = path.join(__dirname, "../test-data/setup-user.json");

  if (fs.existsSync(setupDataPath)) {
    fs.unlinkSync(setupDataPath);
  }
});
