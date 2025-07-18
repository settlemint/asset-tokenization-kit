import { afterAll, beforeAll } from "bun:test";
import { $ } from "bun";
import { getOrpcClient } from "../utils/orpc-client";
import { bootstrapSystem } from "../utils/system-bootstrap";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  setupUser,
  signInWithUser,
} from "../utils/user";

let runningDevServer: Bun.Subprocess | undefined;

beforeAll(async () => {
  try {
    await startDevServerIfNotRunning();

    console.log("Setting up admin account");
    await setupUser(DEFAULT_ADMIN);
    console.log("Setting up investor account");
    await setupUser(DEFAULT_INVESTOR);
    console.log("Setting up issuer account");
    await setupUser(DEFAULT_ISSUER);

    const orpClient = getOrpcClient(await signInWithUser(DEFAULT_ADMIN));
    console.log("Bootstrapping system");
    await bootstrapSystem(orpClient);
  } catch (error) {
    console.error("Failed to setup test environment", error);
    process.exit(1);
  }
});

afterAll(stopDevServer);

process.on("SIGINT", stopDevServer);
process.on("exit", stopDevServer);

async function startDevServerIfNotRunning() {
  if (await isDevServerRunning()) {
    console.log("Dev server already running");
    return;
  }
  const result = await Promise.race([
    startDevServer(),
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      return false;
    })(),
  ]);
  if (!result) {
    throw new Error("Dev server did not start in time");
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

async function startDevServer() {
  console.log("Starting dev server");

  // Create the shell command
  const devProcess = $`bun run dev -- --no-open`.nothrow();
  runningDevServer = devProcess;

  // Stream output to console while monitoring for startup
  const decoder = new TextDecoder();
  let output = "";
  let serverStarted = false;

  // Handle stdout
  if (devProcess.stdout) {
    const reader = devProcess.stdout.getReader();

    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        output += chunk;

        // Output to console in real-time
        process.stdout.write(chunk);

        // Check if server is ready
        const text = output.replace(
          // eslint-disable-next-line no-control-regex, security/detect-unsafe-regex
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ""
        );
        if (/VITE\s+v(.*)\s+ready\s+in/i.test(text) && !serverStarted) {
          serverStarted = true;
          console.log("\nDev server is ready!");
        }
      }
    })();
  }

  // Handle stderr
  if (devProcess.stderr) {
    const stderrReader = devProcess.stderr.getReader();

    (async () => {
      while (true) {
        const { done, value } = await stderrReader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        process.stderr.write(chunk);
      }
    })();
  }

  // Wait for server to be ready
  const startTime = Date.now();
  while (!serverStarted && Date.now() - startTime < 10_000) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!serverStarted) {
    throw new Error("Dev server did not start in time");
  }

  return true;
}

async function stopDevServer() {
  if (!runningDevServer) {
    return;
  }
  console.log("Stopping dev server");
  runningDevServer.kill();
  runningDevServer = undefined;
}
