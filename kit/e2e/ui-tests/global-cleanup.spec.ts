import { test } from "@playwright/test";
import * as fs from "node:fs";
import { getSetupUserPath } from "../utils/setup-user";

test("cleanup setup data", async () => {
  const setupDataPath = getSetupUserPath();

  if (fs.existsSync(setupDataPath)) {
    fs.unlinkSync(setupDataPath);
  }
});
