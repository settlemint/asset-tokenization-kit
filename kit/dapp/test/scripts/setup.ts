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

  // Just call startDevServer directly - it has its own timeout logic
  await startDevServer();
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

  // Create a custom WritableStream to capture and display output
  let output = "";
  let serverStarted = false;

  const customStdout = new WritableStream({
    write(chunk) {
      const text = new TextDecoder().decode(chunk);
      output += text;
      process.stdout.write(text);

      // Check if server is ready
      const cleanText = output.replace(
        // eslint-disable-next-line no-control-regex, security/detect-unsafe-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      );

      if (/VITE\s+v(.*)\s+ready\s+in/i.test(cleanText) && !serverStarted) {
        serverStarted = true;
        console.log("\nDev server is ready!");
      }
    },
  });

  const customStderr = new WritableStream({
    write(chunk) {
      process.stderr.write(chunk);
    },
  });

  // Use Bun shell with custom streams
  const shellPromise = $`bun run dev -- --no-open`
    .stdout(customStdout)
    .stderr(customStderr)
    .nothrow();

  // Start a separate async task to monitor the shell process
  (async () => {
    runningDevServer = await shellPromise;
  })();

  // Wait for server to be ready or timeout
  const startTime = Date.now();
  while (!serverStarted && Date.now() - startTime < 10_000) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if we have a subprocess and if it has exited
    if (runningDevServer && runningDevServer.exitCode !== null) {
      throw new Error(
        `Dev server exited with code ${runningDevServer.exitCode}`
      );
    }
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
