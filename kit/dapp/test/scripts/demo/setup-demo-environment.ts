import { TimeIntervalEnum } from "@atk/zod/time-interval";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { getDappUrl } from "@test/fixtures/dapp";
import { createFixedYieldSchedule } from "@test/fixtures/fixed-yield-schedule";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  bootstrapAddons,
  bootstrapSystem,
  bootstrapTokenFactories,
  createAndRegisterUserIdentities,
  issueDefaultKycClaims,
  setDefaultSystemSettings,
  setupDefaultAdminRoles,
  setupDefaultIssuerRoles,
  setupTrustedClaimIssuers,
} from "@test/fixtures/system-bootstrap";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_PINCODE,
  getUserData,
  setupUser,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import { BONDS } from "./data/demo-assets";
import { DE_COUNTRY_CODE } from "./data/demo-country-codes";
import {
  ADMIN,
  GERMAN_INVESTOR_1,
  GERMAN_INVESTOR_2,
  ISSUER,
  JAPANESE_INVESTOR,
} from "./data/demo-users";

const logger = createLogger({ level: "info" });

logger.info(`Setting up demo environment (dApp url: ${getDappUrl()})`);

logger.info("Setting up users");
// Setup users
await setupUser(ADMIN); // Admin first to be able to create the system
// Do one by one to avoid hitting the rate limits of better auth
await setupUser(GERMAN_INVESTOR_1);
await setupUser(GERMAN_INVESTOR_2);
await setupUser(ISSUER);
await setupUser(JAPANESE_INVESTOR);

const adminClient = getOrpcClient(await signInWithUser(ADMIN));
const issuerClient = getOrpcClient(await signInWithUser(ISSUER));

const germanInvestor1 = await getUserData(GERMAN_INVESTOR_1);
const germanInvestor2 = await getUserData(GERMAN_INVESTOR_2);
const issuer = await getUserData(ISSUER);

// Setup system
const system = await bootstrapSystem(adminClient);

logger.info("Bootstrapping system");
await Promise.all([
  bootstrapTokenFactories(adminClient),
  bootstrapAddons(adminClient),
  (async () => {
    await setupDefaultAdminRoles(adminClient);
    await createAndRegisterUserIdentities(adminClient, [ADMIN, ISSUER], "BE");
    await setupTrustedClaimIssuers(adminClient, ISSUER);
    await createAndRegisterUserIdentities(
      adminClient,
      [GERMAN_INVESTOR_1, GERMAN_INVESTOR_2],
      "DE"
    );
    await issueDefaultKycClaims(adminClient, [
      ADMIN,
      ISSUER,
      GERMAN_INVESTOR_1,
      GERMAN_INVESTOR_2,
    ]);
  })(),
  setupDefaultIssuerRoles(adminClient, ISSUER),
  setDefaultSystemSettings(adminClient, "EUR"),
  createAndRegisterUserIdentities(adminClient, [JAPANESE_INVESTOR], "JP", true),
]);

logger.info("Creating denomination token");

// Create tokens with compliance enabled
const denominationToken = await createToken(
  issuerClient,
  {
    type: "deposit",
    name: "Proof-of-Deposit",
    symbol: "POD",
    decimals: 18,
    countryCode: DE_COUNTRY_CODE,
    basePrice: from("1.00", 2),
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
  },
  {
    useExactName: true,
    grantRole: [
      "custodian",
      "emergency",
      "governance",
      "supplyManagement",
      "tokenManager",
    ],
    unpause: true,
  }
);

const countryAllowListModule =
  system.complianceModuleRegistry.complianceModules.find(
    (m) => m.typeId === "CountryAllowListComplianceModule"
  );
const smartIdentityVerificationModule =
  system.complianceModuleRegistry.complianceModules.find(
    (m) => m.typeId === "SMARTIdentityVerificationComplianceModule"
  );
const topics = await adminClient.system.claimTopics.topicList({});
const amlTopic = topics.find((t) => t.name === "antiMoneyLaundering");
const kycTopic = topics.find((t) => t.name === "knowYourCustomer");

for (const bondToCreate of BONDS) {
  logger.info(`Creating bond: ${bondToCreate.name}`);
  const initialModulePairs: Parameters<
    typeof createToken
  >[1]["initialModulePairs"] = [];
  if (
    countryAllowListModule &&
    Array.isArray(bondToCreate.countries) &&
    bondToCreate.countries.length > 0
  ) {
    initialModulePairs.push({
      typeId: "CountryAllowListComplianceModule",
      module: countryAllowListModule.id,
      values: bondToCreate.countries,
    });
  }
  if (smartIdentityVerificationModule && amlTopic && kycTopic) {
    initialModulePairs.push({
      typeId: "SMARTIdentityVerificationComplianceModule",
      module: smartIdentityVerificationModule.id,
      values: [
        {
          nodeType: 0,
          value: BigInt(amlTopic?.topicId),
        },
        {
          nodeType: 1,
          value: 0n,
        },
        {
          nodeType: 0,
          value: BigInt(kycTopic?.topicId),
        },
      ],
    });
  }
  const bond = await createToken(
    issuerClient,
    {
      name: bondToCreate.name,
      symbol: bondToCreate.symbol,
      isin: bondToCreate.isin,
      decimals: 18,
      type: "bond",
      countryCode: DE_COUNTRY_CODE,
      cap: bondToCreate.cap,
      faceValue: from(1, 18),
      maturityDate: bondToCreate.maturityDate,
      denominationAsset: denominationToken.id,
      initialModulePairs,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    },
    {
      useExactName: true,
      grantRole: [
        "custodian",
        "emergency",
        "governance",
        "supplyManagement",
        "tokenManager",
      ],
      unpause: true,
    }
  );

  if (bond.bond?.isMatured) {
    continue;
  }

  // Give the issuer some tokens so the yield can be paid out
  // And the bond some tokens so the bond can be matured
  logger.info("Minting tokens to the issuer and bond");
  await issuerClient.token.mint({
    contract: denominationToken.id,
    recipients: [issuer.wallet, bond.id],
    amounts: [from(1_000, 18), from(100_000, 18)],
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
  });

  if (!bond.yield?.schedule?.id) {
    // Set yield schedule
    logger.info("Creating yield schedule");
    const schedule = await createFixedYieldSchedule(adminClient, {
      yieldRate: bondToCreate.yieldRate,
      paymentInterval: TimeIntervalEnum.YEARLY,
      startTime: bondToCreate.issueDate,
      endTime: bondToCreate.maturityDate,
      token: bond.id,
      countryCode: DE_COUNTRY_CODE,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    logger.info("Setting yield schedule");
    await issuerClient.token.setYieldSchedule({
      contract: bond.id,
      schedule: schedule.address,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // Top up the denomination asset so the yield can be paid out
    logger.info("Topping up yield schedule");
    await issuerClient.fixedYieldSchedule.topUp({
      contract: schedule.address,
      amount: from(500, 18),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  }

  // Mint some tokens to the german investors
  logger.info("Minting tokens to the german investors");
  await issuerClient.token.mint({
    contract: bond.id,
    recipients: [germanInvestor1.wallet, germanInvestor2.wallet],
    amounts: [from(10, 18), from(38, 18)],
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
  });
}
