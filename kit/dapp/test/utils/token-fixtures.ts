import type { OrpcClient } from "./orpc-client";
import { createToken } from "./token";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "./user";
import { getOrpcClient } from "./orpc-client";

export interface TestTokens {
  bond: Awaited<ReturnType<typeof createToken>>;
  stablecoin: Awaited<ReturnType<typeof createToken>>;
  deposit: Awaited<ReturnType<typeof createToken>>;
}

export interface TokenStatsTestContext {
  tokens: TestTokens;
  client: OrpcClient;
  headers: Headers;
}

/**
 * Create a bond token for testing
 */
export async function createBondToken(client: OrpcClient, suffix = "") {
  return createToken(client, {
    name: `Test Bond Token${suffix}`,
    symbol: `TBT${suffix}`,
    decimals: 18,
    type: "bond",
    countryCode: "056",
    faceValue: "1000",
    maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    underlyingAsset: "0x0000000000000000000000000000000000000001",
    initialModulePairs: [],
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
  });
}

/**
 * Create a stablecoin token for testing
 */
export async function createStablecoinToken(client: OrpcClient, suffix = "") {
  return createToken(client, {
    name: `Test Stablecoin Token${suffix}`,
    symbol: `TST${suffix}`,
    decimals: 18,
    type: "stablecoin",
    countryCode: "056",
    initialModulePairs: [],
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
  });
}

/**
 * Create a deposit token for testing
 */
export async function createDepositToken(client: OrpcClient, suffix = "") {
  return createToken(client, {
    name: `Test Deposit Token${suffix}`,
    symbol: `TDT${suffix}`,
    decimals: 18,
    type: "deposit",
    countryCode: "056",
    initialModulePairs: [],
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
  });
}

/**
 * Create all test tokens and wait for sync
 */
export async function createTestTokens(
  suffix = ""
): Promise<TokenStatsTestContext> {
  const headers = await signInWithUser(DEFAULT_ADMIN);
  const client = getOrpcClient(headers);

  // Create tokens sequentially to avoid race conditions
  const bond = await createBondToken(client, suffix);
  const stablecoin = await createStablecoinToken(client, suffix);
  const deposit = await createDepositToken(client, suffix);

  const tokens = { bond, stablecoin, deposit };

  // Simple wait for indexing
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return { tokens, client, headers };
}

/**
 * Create a single token for simple test scenarios
 */
export async function createSingleTestToken(
  type: "bond" | "stablecoin" | "deposit",
  suffix = ""
): Promise<{
  token: Awaited<ReturnType<typeof createToken>>;
  client: OrpcClient;
  headers: Headers;
}> {
  const headers = await signInWithUser(DEFAULT_ADMIN);
  const client = getOrpcClient(headers);

  let token: Awaited<ReturnType<typeof createToken>>;

  switch (type) {
    case "bond":
      token = await createBondToken(client, suffix);
      break;
    case "stablecoin":
      token = await createStablecoinToken(client, suffix);
      break;
    case "deposit":
      token = await createDepositToken(client, suffix);
      break;
  }

  // Simple wait for indexing
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return { token, client, headers };
}
