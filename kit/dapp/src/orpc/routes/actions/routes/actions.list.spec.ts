import { getAnvilBasedFutureDate } from "@/test/anvil";
import { getOrpcClient, OrpcClient } from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_PINCODE,
  getUserData,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { beforeAll, describe, expect, it } from "vitest";

describe("Actions list (integration)", () => {
  let client: OrpcClient;
  let bond: Awaited<ReturnType<typeof createToken>>;

  beforeAll(async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    client = getOrpcClient(headers);

    // Deposit token to use as denomination asset
    const depositToken = await createToken(
      client,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        type: "deposit" as const,
        name: `Actions Test Deposit`,
        symbol: "TAD",
        decimals: 18,
        initialModulePairs: [],
        basePrice: from("1.00", 2),
        countryCode: "056",
      },
      {
        grantRole: ["supplyManagement", "emergency"],
        unpause: true,
      }
    );

    const maturityDate = await getAnvilBasedFutureDate(1);
    bond = await createToken(
      client,
      {
        type: "bond" as const,
        name: `Actions Test Bond`,
        symbol: "TAB",
        decimals: 18,
        cap: from(1_000_000, 18),
        faceValue: from(1000, depositToken.decimals),
        maturityDate,
        denominationAsset: depositToken.id,
        initialModulePairs: [],
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        countryCode: "056",
      },
      {
        grantRole: ["governance", "emergency"],
        unpause: true,
      }
    );
  });

  it("can list actions and calculates the status correctly", async () => {
    const now = new Date();
    const actions = await client.actions.list({});
    expect(actions.length).toBeGreaterThan(0);
    for (const action of actions) {
      expect(action.status).toBeDefined();
      if (action.executedAt) {
        expect(action.status).toBe("EXECUTED");
      } else if (
        action.expiresAt &&
        action.expiresAt.getTime() <= now.getTime()
      ) {
        expect(action.status).toBe("EXPIRED");
      } else if (action.activeAt.getTime() > now.getTime()) {
        expect(action.status).toBe("UPCOMING");
      } else {
        expect(action.status).toBe("PENDING");
      }
    }
  });

  it("filters actions by PENDING status", async () => {
    const now = new Date();
    const actions = await client.actions.list({ status: "PENDING" });
    expect(actions.every((action) => action.status === "PENDING")).toBe(true);
    expect(actions.every((action) => !action.executedAt)).toBe(true);
    expect(
      actions.every((action) => action.activeAt.getTime() <= now.getTime())
    ).toBe(true);
  });

  it("filters actions by UPCOMING status", async () => {
    const now = new Date();
    const actions = await client.actions.list({ status: "UPCOMING" });
    expect(actions.every((action) => action.status === "UPCOMING")).toBe(true);
    expect(actions.every((action) => !action.executedAt)).toBe(true);
    expect(
      actions.every((action) => action.activeAt.getTime() > now.getTime())
    ).toBe(true);
  });

  it("filters actions by EXECUTED status", async () => {
    const actions = await client.actions.list({ status: "EXECUTED" });
    expect(actions.every((action) => action.status === "EXECUTED")).toBe(true);
    expect(
      actions.every((action) => !!action.executedAt && !!action.executedBy)
    ).toBe(true);
  });

  it("filters actions by EXPIRED status", async () => {
    const now = new Date();
    const actions = await client.actions.list({ status: "EXPIRED" });
    expect(actions.every((action) => action.status === "EXPIRED")).toBe(true);
    expect(actions.every((action) => !action.executedAt)).toBe(true);
    expect(
      actions.every(
        (action) =>
          action.expiresAt && action.expiresAt.getTime() <= now.getTime()
      )
    ).toBe(true);
  });

  it("shows the correct actions for the bond asset", async () => {
    const actions = await client.actions.list({ targets: [bond.id] });
    expect(actions.length).toBe(1);
    const adminUserData = await getUserData(DEFAULT_ADMIN);
    expect(actions).toEqual([
      {
        id: expect.any(String),
        name: "MatureBond",
        target: bond.id,
        activeAt: bond.bond?.maturityDate,
        status: "UPCOMING",
        expiresAt: null,
        executedAt: null,
        executedBy: null,
        executor: {
          id: expect.any(String),
          executors: [adminUserData.wallet],
        },
      },
    ]);
  });
});
