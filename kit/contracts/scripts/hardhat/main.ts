import { batchAddToRegistry } from "./actions/add-to-registry";
import { addTrustedIssuer } from "./actions/add-trusted-issuer";
import { grantRole } from "./actions/grant-role";
import { issueVerificationClaims } from "./actions/issue-verification-claims";
import { recoverIdentity } from "./actions/recover-identity";
import { setGlobalBlockedAddresses } from "./actions/set-global-blocked-addressess";
import { setGlobalBlockedCountries } from "./actions/set-global-blocked-countries";
import { setGlobalBlockedIdentities } from "./actions/set-global-blocked-identities";
import { grantRoles } from "./assets/actions/core/grant-roles";
import { mint } from "./assets/actions/core/mint";
import { recoverErc20Tokens } from "./assets/actions/core/recover-erc20-tokens";
import { recoverTokens } from "./assets/actions/core/recover-tokens";
import { forcedRecoverTokens } from "./assets/actions/custodian/forced-recover-tokens";
import { forcedTransfer } from "./assets/actions/custodian/forced-transfer";
import { createBond } from "./assets/bond";
import { createDeposit } from "./assets/deposit";
import { createEquity } from "./assets/equity";
import { createFund } from "./assets/fund";
import { createPausedAsset } from "./assets/paused";
import { createStableCoin } from "./assets/stablecoin";
import { Countries } from "./constants/countries";
import { ATKRoles } from "./constants/roles";
import { ATKTopic } from "./constants/topics";
import { claimIssuer } from "./entities/actors/claim-issuer";
import {
  frozenInvestor,
  investorA,
  investorANew,
  investorB,
  maliciousInvestor,
} from "./entities/actors/investors";
import { owner } from "./entities/actors/owner";
import { AirdropMerkleTree } from "./entities/airdrop/merkle-tree";
import { atkDeployer } from "./services/deployer";
import { topicManager } from "./services/topic-manager";
import { createAirdrops } from "./system-addons/airdrop";
import { createDistribution } from "./system-addons/airdrop/distribution";
import { createXvpSettlement } from "./system-addons/xvp/xvp-settlement";
import { setAnvilNextBlockTimestamp } from "./utils/anvil";

async function main() {
  console.log("\n=== Setting up smart protocol... ===\n");

  // Setup the smart protocol
  await atkDeployer.setUp({
    displayUi: true,
  });

  console.log("\n=== Setting up actors... ===\n");

  // Initialize the actors
  await Promise.all([
    owner.initialize(),
    claimIssuer.initialize(),
    investorA.initialize(),
    investorB.initialize(),
    frozenInvestor.initialize(),
    maliciousInvestor.initialize(),
  ]);

  // Print initial balances
  await owner.printBalance();
  await claimIssuer.printBalance();
  await investorA.printBalance();
  await investorB.printBalance();
  await frozenInvestor.printBalance();
  await maliciousInvestor.printBalance();

  // Add the actors to the registry
  await batchAddToRegistry([
    owner,
    investorA,
    investorB,
    frozenInvestor,
    maliciousInvestor,
  ]);

  // Grant fixed yield schedule factory to allow list manager
  // TODO: this is a temporary solution, will be fixed in the future
  await grantRole(
    atkDeployer.getComplianceContract().address,
    owner,
    ATKRoles.bypassListManagerRole,
    atkDeployer.getFixedYieldScheduleFactoryContract().address
  );

  console.log("\n=== Setting up anvil... ===\n");

  // Set the initial block timestamp to the current time
  const now = Math.floor(Date.now() / 1000);
  await setAnvilNextBlockTimestamp(owner, now);

  console.log("\n=== Setting up topics and trusted issuers... ===\n");

  // Initialize the TopicManager with the deployed topic registry
  await topicManager.initialize();

  // Add the claim issuer as a trusted issuer
  const claimIssuerIdentity = await claimIssuer.getIdentity();
  await addTrustedIssuer(claimIssuerIdentity, [
    topicManager.getTopicId(ATKTopic.kyc),
    topicManager.getTopicId(ATKTopic.aml),
    topicManager.getTopicId(ATKTopic.collateral),
    topicManager.getTopicId(ATKTopic.assetClassification),
    topicManager.getTopicId(ATKTopic.basePrice),
  ]);

  console.log("\n=== Verify the actors... ===\n");

  // make sure every actor is verified
  await Promise.all([
    issueVerificationClaims(owner),
    issueVerificationClaims(investorA),
    issueVerificationClaims(investorB),
    issueVerificationClaims(frozenInvestor),
    issueVerificationClaims(maliciousInvestor),
  ]);

  console.log("\n=== Setting up compliance modules... ===\n");

  // block RU in the country block list module
  await setGlobalBlockedCountries([Countries.RU]);

  // Block malicious user
  await setGlobalBlockedAddresses([maliciousInvestor.address]);
  await setGlobalBlockedIdentities([await maliciousInvestor.getIdentity()]);

  // Create the assets
  const deposit = await createDeposit();
  const bond = await createBond(deposit);
  const equity = await createEquity();
  const fund = await createFund();
  const stableCoin = await createStableCoin();

  // Create the addons

  // Addon - Airdrop
  const distribution = createDistribution({
    ownerAddress: owner.address,
    investorAAddress: investorA.address,
    investorBAddress: investorB.address,
    frozenInvestorAddress: frozenInvestor.address,
    claimIssuerAddress: claimIssuer.address,
  });
  const merkleTree = new AirdropMerkleTree(distribution);
  await createAirdrops(stableCoin, merkleTree);

  // Addon -XVP Settlement
  await createXvpSettlement(
    investorA, // fromActor
    investorB, // toActor
    stableCoin.address, // fromAssetAddress (stablecoin)
    equity.address, // toAssetAddress (equity)
    5n * 10n ** 18n, // fromAmount (5 stablecoin)
    2n * 10n ** 18n, // toAmount (2 equity)
    false // autoExecute
  );

  await createPausedAsset();

  // Recover identity & tokens
  console.log("\n=== Recover identity & tokens... ===\n");
  await investorANew.initialize();
  await recoverIdentity(investorA, investorANew);
  await forcedRecoverTokens(deposit, owner, investorANew, investorA.address);
  await recoverTokens(equity, investorANew, investorA.address);
  await recoverTokens(bond, investorANew, investorA.address);
  await recoverTokens(fund, investorANew, investorA.address);
  await recoverTokens(stableCoin, investorANew, investorA.address);

  // can be done upfront as well, put it here to show that this is a forced transfer
  await issueVerificationClaims(investorANew);

  console.log("\n=== Recover ERC20 tokens! ===\n");
  await mint(stableCoin, investorANew, 10n);

  // need to force transfer it into the equity contract ... else it will throw RecipientNotVerified
  await forcedTransfer(stableCoin, owner, investorANew, equity, 10n);

  await grantRoles(equity, owner, [ATKRoles.emergencyRole]);
  await recoverErc20Tokens(equity, owner, stableCoin, investorANew, 10n);
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
