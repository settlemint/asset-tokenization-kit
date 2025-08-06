const PORT = process.env.TEST_DAPP_PORT ?? "13000";

export function getDappUrl() {
  return `http://localhost:${PORT}`;
}