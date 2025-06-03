import { batchAddToRegistry } from "./actions/add-to-registry";
import { addTrustedIssuer } from "./actions/add-trusted-issuer";
import { issueVerificationClaims } from "./actions/issue-verification-claims";
import { recoverIdentity } from "./actions/recover-identity";
import { setGlobalBlockedCountries } from "./actions/set-global-blocked-countries";
import { recoverTokens } from "./assets/actions/recover-tokens";
import { createBond } from "./assets/bond";
import { createDeposit } from "./assets/deposit";
import { createEquity } from "./assets/equity";
import { createFund } from "./assets/fund";
import { createStablecoin } from "./assets/stablecoin";
import { Countries } from "./constants/countries";
import { SMARTTopic } from "./constants/topics";
import { claimIssuer } from "./entities/actors/claim-issuer";
import {
  investorA,
  investorANew,
  investorB,
} from "./entities/actors/investors";
import { owner } from "./entities/actors/owner";
import { smartProtocolDeployer } from "./services/deployer";
import { topicManager } from "./services/topic-manager";

async function main() {
  console.log("\n=== Setting up smart protocol... ===\n");

  // Setup the smart protocol
  await smartProtocolDeployer.setUp({
    displayUi: true,
  });

  console.log("\n=== Setting up actors... ===\n");

  // Initialize the actors
  await Promise.all([
    owner.initialize(),
    claimIssuer.initialize(),
    investorA.initialize(),
    investorB.initialize(),
  ]);

  // Print initial balances
  await owner.printBalance();
  await claimIssuer.printBalance();
  await investorA.printBalance();
  await investorB.printBalance();

  // Add the actors to the registry
  await batchAddToRegistry([owner, investorA, investorB]);

  console.log("\n=== Setting up topics and trusted issuers... ===\n");

  // Initialize the TopicManager with the deployed topic registry
  await topicManager.initialize();

  // Add the claim issuer as a trusted issuer
  const claimIssuerIdentity = await claimIssuer.getIdentity();
  await addTrustedIssuer(claimIssuerIdentity, [
    topicManager.getTopicId(SMARTTopic.kyc),
    topicManager.getTopicId(SMARTTopic.aml),
    topicManager.getTopicId(SMARTTopic.collateral),
    topicManager.getTopicId(SMARTTopic.assetClassification),
  ]);

  console.log("\n=== Verify the actors... ===\n");

  // make sure every actor is verified
  await Promise.all([
    issueVerificationClaims(owner),
    issueVerificationClaims(investorA),
    issueVerificationClaims(investorB),
  ]);

  console.log("\n=== Setting up compliance modules... ===\n");

  // block RU in the country block list module
  await setGlobalBlockedCountries([Countries.RU]);

  // Create the assets
  const deposit = await createDeposit();
  const equity = await createEquity();
  const bond = await createBond(deposit);
  const fund = await createFund();
  const stablecoin = await createStablecoin();

  // Recover identity & tokens
  console.log("\n=== Recover identity & tokens... ===\n");

  await investorANew.initialize();
  await recoverIdentity(investorA, investorANew);
  await recoverTokens(deposit, investorANew, investorA.address);
  await recoverTokens(equity, investorANew, investorA.address);
  await recoverTokens(bond, investorANew, investorA.address);
  await recoverTokens(fund, investorANew, investorA.address);
  await recoverTokens(stablecoin, investorANew, investorA.address);

  // can be done upfront as well, put it here to show that this is a forced transfer
  await issueVerificationClaims(investorANew);
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
