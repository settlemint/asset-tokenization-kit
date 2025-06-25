import { afterAll, beforeAll } from "bun:test";
import { getOrpcClient } from "test/utils/orpc-client";
import { bootstrapSystem } from "test/utils/system-bootstrap";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  setupUser,
  signInWithUser,
} from "../utils/auth-client";

let runningDevServer: Bun.Subprocess;

beforeAll(async () => {
  try {
    console.log("Setting up test accounts");
    await setupUser(DEFAULT_ADMIN);
    await setupUser(DEFAULT_INVESTOR);
    await setupUser(DEFAULT_ISSUER);

    await startDevServer();

    const orpClient = getOrpcClient(await signInWithUser(DEFAULT_ADMIN));
    await bootstrapSystem(orpClient);
  } catch (error) {
    console.error("Failed to setup test environment", error);
    process.exit(1);
  }
});

afterAll(() => {
  runningDevServer?.kill();
});

async function startDevServer() {
  if (await isDevServerRunning()) {
    console.log("Dev server already running");
    return;
  }

  console.log("Starting dev server");
  const devProcess = Bun.spawn(["bun", "run", "dev", "--", "--no-open"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  runningDevServer = devProcess;

  // Wait for "completed" in stdout
  const reader = devProcess.stdout?.getReader();
  const decoder = new TextDecoder();
  let output = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    output += chunk;

    if (/VITE v(.*) ready in/.test(output)) {
      console.log("Dev server started");
      reader.releaseLock();
      break;
    }
  }
}

async function isDevServerRunning() {
  try {
    const response = await fetch("http://localhost:3000");
    return response.ok;
  } catch {
    return false;
  }
}
