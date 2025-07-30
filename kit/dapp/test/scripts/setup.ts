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

let runningDevServer: any | undefined;

export async function setup() {
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
    const system = await bootstrapSystem(orpClient);
    console.log("Bootstrapping token factories");
    await bootstrapTokenFactories(orpClient, system);
  } catch (error: unknown) {
    console.error("Failed to setup test environment", error);
    process.exit(1);
  }
}

export const teardown = stopDevServer;

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

  // Use child_process.spawn for better control over streams
  const { spawn } = await import("child_process");
  runningDevServer = spawn("bun", ["run", "dev", "--", "--no-open"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  let serverStarted = false;

  // Handle stdout streaming
  if (runningDevServer.stdout) {
    runningDevServer.stdout.on("data", (data: Buffer) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(chunk);

      // Check if server is ready
      const cleanText = output.replace(
        // eslint-disable-next-line no-control-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      );

      if (/VITE\s+v(.*)\s+ready\s+in/i.test(cleanText) && !serverStarted) {
        serverStarted = true;
        console.log("\nDev server is ready!");
      }
    });
  }

  // Handle stderr streaming
  if (runningDevServer.stderr) {
    runningDevServer.stderr.on("data", (data: Buffer) => {
      process.stderr.write(data.toString());
    });
  }

  // Wait for server to be ready or timeout
  const startTime = Date.now();
  while (!serverStarted && Date.now() - startTime < 10_000) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if process is still running
    if (
      runningDevServer.exitCode !== null &&
      runningDevServer.exitCode !== undefined
    ) {
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
