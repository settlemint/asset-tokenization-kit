/** biome-ignore-all lint/suspicious/noControlCharactersInRegex: test cleanup regex patterns */
/** biome-ignore-all lint/suspicious/useAwait: async cleanup function */
/** biome-ignore-all lint/performance/useTopLevelRegex: regex only used in test cleanup */
import { afterAll, beforeAll } from 'bun:test';
import { getOrpcClient } from '../utils/orpc-client';
import { bootstrapSystem } from '../utils/system-bootstrap';
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  setupUser,
  signInWithUser,
} from '../utils/user';

let runningDevServer: Bun.Subprocess | undefined;

beforeAll(async () => {
  try {
    await startDevServerIfNotRunning();
    await setupUser(DEFAULT_ADMIN);
    await setupUser(DEFAULT_INVESTOR);
    await setupUser(DEFAULT_ISSUER);

    const orpClient = getOrpcClient(await signInWithUser(DEFAULT_ADMIN));
    await bootstrapSystem(orpClient);
  } catch (_error) {
    process.exit(1);
  }
});

afterAll(stopDevServer);

process.on('SIGINT', stopDevServer);
process.on('exit', stopDevServer);

async function startDevServerIfNotRunning() {
  if (await isDevServerRunning()) {
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
    throw new Error('Dev server did not start in time');
  }
}

async function isDevServerRunning() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

async function startDevServer() {
  const devProcess = Bun.spawn(['bun', 'run', 'dev', '--', '--no-open'], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  runningDevServer = devProcess;

  // Wait for "completed" in stdout
  const reader = devProcess.stdout?.getReader();
  const decoder = new TextDecoder();
  let output = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = decoder.decode(value);
    output += chunk;

    // Output to main process stdout
    process.stdout.write(chunk);

    // Remove all ANSI colors/styles from strings
    const text = output.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ''
    );
    if (/VITE\s+v(.*)\s+ready\s+in/i.test(text)) {
      reader.releaseLock();
      break;
    }
  }
  return true;
}

async function stopDevServer() {
  if (!runningDevServer) {
    return;
  }
  runningDevServer.kill();
  runningDevServer = undefined;
}
