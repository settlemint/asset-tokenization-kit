import { afterAll, beforeAll } from "bun:test";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  setupUser,
} from "../utils/user";

let runningDevServer: Bun.Subprocess;

beforeAll(async () => {
  try {
    await startDevServerIfNotRunning();

    console.log("Setting up admin account");
    await setupUser(DEFAULT_ADMIN);
    console.log("Setting up investor account");
    await setupUser(DEFAULT_INVESTOR);
    console.log("Setting up issuer account");
    await setupUser(DEFAULT_ISSUER);

    // const orpClient = getOrpcClient(await signInWithUser(DEFAULT_ADMIN));
    // console.log("Bootstrapping system");
    // await bootstrapSystem(orpClient);
  } catch (error) {
    console.error("Failed to setup test environment", error);
    process.exit(1);
  }
});

afterAll(() => {
  runningDevServer?.kill();
});

process.on("SIGINT", () => {
  runningDevServer?.kill();
});
process.on("exit", () => {
  runningDevServer?.kill();
});

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
    if (done) {
      console.log("Dev server started");
      break;
    }

    const chunk = decoder.decode(value);
    output += chunk;

    // Output to main process stdout
    process.stdout.write(chunk);

    if (/VITE v(.*) ready in/.test(output)) {
      console.log("Dev server started");
      reader.releaseLock();
      break;
    }
  }
  return true;
}
