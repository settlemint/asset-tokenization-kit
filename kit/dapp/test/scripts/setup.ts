import { afterAll, beforeAll } from "bun:test";
import { getOrpcClient } from "../utils/orpc-client";
import {
  bootstrapSystem,
  bootstrapTokenFactories,
} from "../utils/system-bootstrap";
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
    console.log("Bootstrapping token factories");
    await bootstrapTokenFactories(orpClient);
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

  // Use Bun.spawn for better control over streams
  runningDevServer = Bun.spawn(["bun", "run", "dev", "--", "--no-open"], {
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
  });

  let output = "";
  let serverStarted = false;
  const decoder = new TextDecoder();

  // Handle stdout streaming
  if (runningDevServer.stdout && typeof runningDevServer.stdout !== "number") {
    const reader = runningDevServer.stdout.getReader();

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          output += chunk;

          // Output to console in real-time
          process.stdout.write(chunk);

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
        }
      } catch (error) {
        console.error("Error reading stdout:", error);
      }
    })();
  }

  // Handle stderr streaming
  if (runningDevServer.stderr && typeof runningDevServer.stderr !== "number") {
    const reader = runningDevServer.stderr.getReader();

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          process.stderr.write(chunk);
        }
      } catch (error) {
        console.error("Error reading stderr:", error);
      }
    })();
  }

  // Wait for server to be ready or timeout
  const startTime = Date.now();
  while (!serverStarted && Date.now() - startTime < 10_000) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if process is still running
    if (runningDevServer.exitCode !== null) {
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
