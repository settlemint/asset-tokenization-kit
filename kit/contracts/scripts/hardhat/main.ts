import { addToBypassList } from "./actions/add-to-bypass-list";
import { batchAddToRegistry } from "./actions/add-to-registry";
import { addTrustedIssuer } from "./actions/add-trusted-issuer";
import { grantSystemRole } from "./actions/grant-system-role";
import { grantSystemRoles } from "./actions/grant-system-roles";
import { issueVerificationClaims } from "./actions/issue-verification-claims";
import { recoverIdentity } from "./actions/recover-identity";
import { removeFromBypassList } from "./actions/remove-from-bypass-list";
import { removeIdentityKeys } from "./actions/remove-identity-keys";
import { revokeClaims } from "./actions/revoke-claims";
import { setGlobalBlockedAddresses } from "./actions/set-global-blocked-addressess";
import { setGlobalBlockedCountries } from "./actions/set-global-blocked-countries";
import { setGlobalBlockedIdentities } from "./actions/set-global-blocked-identities";
import { grantRoles as grantAssetRoles } from "./assets/actions/core/grant-roles";
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
import {
  claimIssuer,
  frozenInvestor,
  investorA,
  investorANew,
  investorB,
  maliciousInvestor,
  owner,
} from "./constants/actors";
import { Countries } from "./constants/countries";
import { KeyPurpose } from "./constants/key-purposes";
import { ATKRoles } from "./constants/roles";
import { ATKTopic } from "./constants/topics";
import { AirdropMerkleTree } from "./entities/airdrop/merkle-tree";
import { atkDeployer } from "./services/deployer";
import { topicManager } from "./services/topic-manager";
import { createAirdrops } from "./system-addons/airdrop";
import { createDistribution } from "./system-addons/airdrop/distribution";
import { createXvpSettlement } from "./system-addons/xvp/xvp-settlement";

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

  await grantSystemRole(
    owner,
    ATKRoles.people.identityManagerRole,
    owner.address
  );

  // Add the actors to the registry
  await batchAddToRegistry([
    owner,
    investorA,
    investorB,
    frozenInvestor,
    maliciousInvestor,
  ]);

  console.log("\n=== Setting up topics and trusted issuers... ===\n");

  // Initialize the TopicManager with the deployed topic registry
  await topicManager.initialize();

  // Add the claim issuer as a trusted issuer
  await grantSystemRole(
    owner,
    ATKRoles.people.claimPolicyManagerRole,
    owner.address
  );

  const claimIssuerIdentity = await claimIssuer.getIdentity();
  await addTrustedIssuer(claimIssuerIdentity, [
    topicManager.getTopicId(ATKTopic.kyc),
    topicManager.getTopicId(ATKTopic.aml),
    topicManager.getTopicId(ATKTopic.collateral),
    topicManager.getTopicId(ATKTopic.assetClassification),
    topicManager.getTopicId(ATKTopic.basePrice),
    topicManager.getTopicId(ATKTopic.isin),
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

  // Revoke aml claims for malicious investor
  await revokeClaims(maliciousInvestor, ATKTopic.aml);

  // Remove the claim signer key for the malicious investor
  await removeIdentityKeys(maliciousInvestor, KeyPurpose.claimSigner);

  console.log("\n=== Setting up compliance modules... ===\n");

  await grantSystemRole(
    owner,
    ATKRoles.people.complianceManagerRole,
    owner.address
  );

  // Add and remove some actors from the global compliance bypass list
  await addToBypassList([owner, investorA, investorB]);
  await removeFromBypassList([investorA, investorB]);

  // block RU in the country block list module
  await setGlobalBlockedCountries([Countries.RU]);

  // Block malicious user
  await setGlobalBlockedAddresses([maliciousInvestor.address]);
  await setGlobalBlockedIdentities([await maliciousInvestor.getIdentity()]);

  console.log("\n=== Setting up assets... ===\n");

  // directly add addon role as well because we also need this for yield schedules
  await grantSystemRoles(
    owner,
    [ATKRoles.people.tokenManagerRole, ATKRoles.people.addonManagerRole],
    owner.address
  );

  // Create the assets
  const deposit = await createDeposit();
  const bond = await createBond(deposit);
  const equity = await createEquity();
  const fund = await createFund();
  const stableCoin = await createStableCoin();

  console.log("\n=== Setting up addons... ===\n");

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

  // Addon -XVP Settlement - Single scenario for actions testing
  console.log("\n=== Creating XVP Settlement ===\n");

  // Single unapproved settlement (provides pending actions for testing)
  await createXvpSettlement(
    investorA,
    investorB,
    stableCoin.address,
    equity.address,
    3n * 10n ** 18n,
    1n * 10n ** 18n,
    false
  );
  console.log("✅ XVP settlement created");

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

  await grantAssetRoles(equity, owner, [ATKRoles.assets.emergencyRole]);
  await recoverErc20Tokens(equity, owner, stableCoin, investorANew, 10n);
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
