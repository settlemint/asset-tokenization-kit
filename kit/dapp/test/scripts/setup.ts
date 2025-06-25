import { afterAll, beforeAll } from "bun:test";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  authClient,
} from "../utils/auth-client";

let runningDevServer: Bun.Subprocess;

beforeAll(async () => {
  console.log("Setting up test accounts");
  await authClient.signUp.email(DEFAULT_ADMIN);
  await authClient.signUp.email(DEFAULT_INVESTOR);
  await authClient.signUp.email(DEFAULT_ISSUER);

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
});

afterAll(async () => {
  runningDevServer.kill();
});
