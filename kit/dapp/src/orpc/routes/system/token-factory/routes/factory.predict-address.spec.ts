import { getOrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { describe, expect, test } from "vitest";

describe("Factory predict address", () => {
  test("predicted access manager address matches deployed token's access manager", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Define token parameters that will be used for both prediction and creation
    const tokenParams = {
      type: "equity" as const,
      name: `Test equity ${Date.now()}`,
      symbol: "TSTE",
      decimals: 18,
    };

    // Step 1: Predict the access manager address
    const prediction = await client.system.factory.predictAddress({
      type: tokenParams.type,
      name: tokenParams.name,
      symbol: tokenParams.symbol,
      decimals: tokenParams.decimals,
    });

    expect(prediction.predictedAddress).toBeDefined();

    // Step 2: Deploy a token with the same parameters
    const token = await createToken(
      client,
      {
        ...tokenParams,
        basePrice: from("1.00", 2),
        countryCode: "056",
        class: "COMMON_EQUITY",
        category: "VENTURE_CAPITAL",
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      },
      {
        useExactName: true,
      }
    );

    expect(token).toBeDefined();
    expect(token.id).toBeDefined();

    // Step 3: Get the actual access manager address from the deployed token
    const actualAccessManagerAddress = token.accessControl?.id;

    expect(actualAccessManagerAddress).toBeDefined();

    // Step 4: Verify the predicted address matches the actual access manager address
    expect(actualAccessManagerAddress).toBe(prediction.predictedAddress);
  }, 100_000);

  test("different parameters produce different predicted addresses", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    // Predict for first set of parameters
    const prediction1 = await client.system.factory.predictAddress({
      type: "equity",
      name: "First Token",
      symbol: "FST",
      decimals: 18,
    });

    // Predict for different parameters
    const prediction2 = await client.system.factory.predictAddress({
      type: "equity",
      name: "Second Token",
      symbol: "SND",
      decimals: 18,
    });

    // Predicted addresses should be different for different parameters
    expect(prediction1.predictedAddress).not.toBe(prediction2.predictedAddress);
  }, 100_000);

  test("same name, symbol, and decimals but different asset types produce different predicted addresses", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);

    const sharedParams = {
      name: "Shared Token Name",
      symbol: "SHRD",
      decimals: 18,
    };

    // Predict for equity type
    const equityPrediction = await client.system.factory.predictAddress({
      type: "equity",
      ...sharedParams,
    });

    // Predict for bond type with same name, symbol, and decimals
    const bondPrediction = await client.system.factory.predictAddress({
      type: "bond",
      ...sharedParams,
    });

    // Predicted addresses should be different due to different asset types
    expect(equityPrediction.predictedAddress).not.toBe(
      bondPrediction.predictedAddress
    );
  }, 100_000);
});
