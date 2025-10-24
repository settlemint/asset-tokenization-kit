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
import {
  BONDS,
  DEPOSITS,
  STABLECOINS,
  type DemoAsset,
} from "./data/demo-assets";
import { DE_COUNTRY_CODE } from "./data/demo-country-codes";
import {
  ADMIN,
  GERMAN_INVESTOR_1,
  GERMAN_INVESTOR_2,
  ISSUER,
  JAPANESE_INVESTOR,
  US_INVESTOR,
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
await setupUser(US_INVESTOR);

const adminClient = getOrpcClient(await signInWithUser(ADMIN));
const issuerClient = getOrpcClient(await signInWithUser(ISSUER));

const germanInvestor1 = await getUserData(GERMAN_INVESTOR_1);
const germanInvestor2 = await getUserData(GERMAN_INVESTOR_2);
const issuer = await getUserData(ISSUER);

// Setup system
const system = await bootstrapSystem(adminClient);

const countryAllowListModule =
  system.complianceModuleRegistry.complianceModules.find(
    (m) => m.typeId === "CountryAllowListComplianceModule"
  );
const smartIdentityVerificationModule =
  system.complianceModuleRegistry.complianceModules.find(
    (m) => m.typeId === "SMARTIdentityVerificationComplianceModule"
  );
const tokenSupplyLimitModule =
  system.complianceModuleRegistry.complianceModules.find(
    (m) => m.typeId === "TokenSupplyLimitComplianceModule"
  );
const topics = await adminClient.system.claimTopics.topicList({});
const amlTopic = topics.find((t) => t.name === "antiMoneyLaundering");
const kycTopic = topics.find((t) => t.name === "knowYourCustomer");

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
    await createAndRegisterUserIdentities(adminClient, [US_INVESTOR], "US");
    await issueDefaultKycClaims(adminClient, [
      ADMIN,
      ISSUER,
      GERMAN_INVESTOR_1,
      GERMAN_INVESTOR_2,
      US_INVESTOR,
    ]);
  })(),
  setupDefaultIssuerRoles(adminClient, ISSUER),
  setDefaultSystemSettings(adminClient, "USD"),
  createAndRegisterUserIdentities(adminClient, [JAPANESE_INVESTOR], "JP", true),
]);

let denominationToken: Awaited<ReturnType<typeof createToken>> | undefined =
  undefined;

// Create tokens with compliance enabled

for (const depositToCreate of DEPOSITS) {
  const { isDenominationToken, ...depositData } = depositToCreate;
  logger.info(`Creating deposit: ${depositData.name}`);
  const token = await createToken(
    issuerClient,
    {
      type: "deposit",
      ...depositData,
      basePrice: from("1.00", 2),
      initialModulePairs: getInitialModulePairs(depositData),
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
  if (isDenominationToken) {
    denominationToken = token;
  }
}

for (const bondToCreate of BONDS) {
  if (!denominationToken) {
    throw new Error("Denomination token not found");
  }
  logger.info(`Creating bond: ${bondToCreate.name}`);
  const bond = await createToken(
    issuerClient,
    {
      type: "bond",
      name: bondToCreate.name,
      symbol: bondToCreate.symbol,
      isin: bondToCreate.isin,
      decimals: bondToCreate.decimals,
      countryCode: bondToCreate.countryCode,
      cap: bondToCreate.cap,
      faceValue: bondToCreate.faceValue,
      maturityDate: bondToCreate.maturityDate,
      denominationAsset: denominationToken.id,
      initialModulePairs: getInitialModulePairs(bondToCreate),
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
      paymentInterval: bondToCreate.paymentInterval,
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
      schedule: schedule.id,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // Top up the denomination asset so the yield can be paid out
    logger.info("Topping up yield schedule");
    await issuerClient.fixedYieldSchedule.topUp({
      contract: schedule.id,
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

for (const stableCoinToCreate of STABLECOINS) {
  const { collateral, ...stableCoinData } = stableCoinToCreate;
  logger.info(`Creating stablecoin: ${stableCoinToCreate.name}`);
  const token = await createToken(
    issuerClient,
    {
      type: "stablecoin",
      ...stableCoinData,
      basePrice: from("1.00", 2),
      initialModulePairs: getInitialModulePairs(stableCoinData),
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
  if (!token.identity?.id) {
    throw new Error("Token does not have an identity");
  }
  const oneHundredDaysFromNow = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 100
  );
  await issuerClient.token.updateCollateral({
    contract: token.id,
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
    amount: collateral,
    expiryTimestamp: oneHundredDaysFromNow,
  });
}

function getInitialModulePairs(assetToCreate: DemoAsset) {
  const { compliance } = assetToCreate;
  const initialModulePairs: Parameters<
    typeof createToken
  >[1]["initialModulePairs"] = [];
  if (smartIdentityVerificationModule && amlTopic && kycTopic) {
    initialModulePairs.push({
      typeId: "SMARTIdentityVerificationComplianceModule",
      module: smartIdentityVerificationModule.module,
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
  if (!compliance) {
    return initialModulePairs;
  }

  if (
    countryAllowListModule &&
    Array.isArray(compliance.allowedCountries) &&
    compliance.allowedCountries.length > 0
  ) {
    initialModulePairs.push({
      typeId: "CountryAllowListComplianceModule",
      module: countryAllowListModule.module,
      values: compliance.allowedCountries,
    });
  }

  if (tokenSupplyLimitModule && compliance.tokenSupplyLimit) {
    initialModulePairs.push({
      typeId: "TokenSupplyLimitComplianceModule",
      module: tokenSupplyLimitModule.module,
      values: {
        maxSupply: compliance.tokenSupplyLimit,
        periodLength: 0,
        rolling: false,
        useBasePrice: false,
        global: false,
      },
    });
  }
  return initialModulePairs;
}
