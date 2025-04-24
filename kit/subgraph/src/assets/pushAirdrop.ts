import { Address, log } from "@graphprotocol/graph-ts";
import {
  Bond,
  CryptoCurrency,
  Deposit,
  Equity,
  Fund,
  MerkleRootUpdate,
  PushAirdrop,
  PushBatchDistribution,
  PushDistribution,
  StableCoin,
} from "../../generated/schema";
import {
  BatchDistributed,
  DistributionCapUpdated,
  MerkleRootUpdated,
  TokensDistributed,
  TokensWithdrawn,
} from "../../generated/templates/PushAirdropTemplate/PushAirdrop";

// Use fetchAccount for consistent account entity creation
import { fetchAccount } from "../fetch/account";
import { toDecimals } from "../utils/decimals";

// Helper function to get token decimals from any asset type
function getTokenDecimals(tokenAddress: Address): i32 {
  // Try loading each possible asset type
  let crypto = CryptoCurrency.load(tokenAddress);
  if (crypto) return crypto.decimals;

  let stable = StableCoin.load(tokenAddress);
  if (stable) return stable.decimals;

  let bond = Bond.load(tokenAddress);
  if (bond) return bond.decimals;

  let equity = Equity.load(tokenAddress);
  if (equity) return equity.decimals;

  let fund = Fund.load(tokenAddress);
  if (fund) return fund.decimals;

  let deposit = Deposit.load(tokenAddress);
  if (deposit) return deposit.decimals;

  // Default to 18 if not found
  log.warning("Token not found for address {}, defaulting to 18 decimals", [
    tokenAddress.toHex(),
  ]);
  return 18;
}

// Handler for individual token distribution events
export function handleTokensDistributed(event: TokensDistributed): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping TokensDistributed event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let recipientAddress = event.params.recipient;
  let amount = event.params.amount;

  log.info(
    "TokensDistributed event processed: Airdrop {}, Recipient {}, Amount {}",
    [airdropAddress.toHex(), recipientAddress.toHex(), amount.toString()]
  );

  // Get distributor and recipient accounts
  let distributor = fetchAccount(event.transaction.from);
  let recipient = fetchAccount(recipientAddress);

  // Get token decimals
  let decimals = getTokenDecimals(Address.fromBytes(airdrop.token));
  let amountBD = toDecimals(amount, decimals);

  // Create PushDistribution entity
  let distributionId = event.transaction.hash
    .concatI32(event.logIndex.toI32())
    .toHex();
  let distribution = new PushDistribution(distributionId);
  distribution.airdrop = airdrop.id;
  distribution.distributor = distributor.id;
  distribution.recipient = recipient.id;
  distribution.amount = amountBD;
  distribution.amountExact = amount;
  distribution.timestamp = event.block.timestamp;
  distribution.txHash = event.transaction.hash;
  distribution.blockNumber = event.block.number;
  distribution.logIndex = event.logIndex;
  // batch distribution field is optional, will be null by default
  distribution.save();

  // Update airdrop metadata
  airdrop.totalDistributed = airdrop.totalDistributed.plus(amount);
  airdrop.save();
}

// Handler for batch distribution events
export function handleBatchDistributed(event: BatchDistributed): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping BatchDistributed event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let recipientCount = event.params.recipientCount;
  let totalAmount = event.params.totalAmount;

  log.info(
    "BatchDistributed event processed: Airdrop {}, RecipientCount {}, TotalAmount {}",
    [airdropAddress.toHex(), recipientCount.toString(), totalAmount.toString()]
  );

  // Get distributor account
  let distributor = fetchAccount(event.transaction.from);

  // Get token decimals
  let decimals = getTokenDecimals(Address.fromBytes(airdrop.token));
  let totalAmountBD = toDecimals(totalAmount, decimals);

  // Create PushBatchDistribution entity
  let batchId = event.transaction.hash
    .concatI32(event.logIndex.toI32())
    .toHex();
  let batchDistribution = new PushBatchDistribution(batchId);
  batchDistribution.airdrop = airdrop.id;
  batchDistribution.distributor = distributor.id;
  batchDistribution.recipientCount = recipientCount.toI32();
  batchDistribution.totalAmount = totalAmountBD;
  batchDistribution.totalAmountExact = totalAmount;
  batchDistribution.timestamp = event.block.timestamp;
  batchDistribution.txHash = event.transaction.hash;
  batchDistribution.blockNumber = event.block.number;
  batchDistribution.logIndex = event.logIndex;
  batchDistribution.save();

  // Update airdrop data
  // Note: Individual distributions within the batch will already have updated
  // the totalDistributed value via their individual TokensDistributed events
}

// Handler for tokens withdrawal event
export function handleTokensWithdrawn(event: TokensWithdrawn): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping TokensWithdrawn event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  // Get token details
  let tokenAddress = Address.fromBytes(airdrop.token);
  let amount = event.params.amount;
  let decimals = getTokenDecimals(tokenAddress);
  let amountBD = toDecimals(amount, decimals);

  log.info(
    "TokensWithdrawn event processed (Push): Airdrop {}, To {}, Amount {} ({} with {} decimals)",
    [
      airdropAddress.toHex(),
      event.params.to.toHex(),
      amount.toString(),
      amountBD.toString(),
      decimals.toString(),
    ]
  );

  airdrop.isWithdrawn = true;
  airdrop.save();
}

// Handler for MerkleRootUpdated event
export function handleMerkleRootUpdated(event: MerkleRootUpdated): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping MerkleRootUpdated event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let oldRoot = event.params.oldRoot;
  let newRoot = event.params.newRoot;

  log.info(
    "MerkleRootUpdated event processed: Airdrop {}, OldRoot {}, NewRoot {}",
    [airdropAddress.toHex(), oldRoot.toHexString(), newRoot.toHexString()]
  );

  // Create MerkleRootUpdate entity to track the change
  let updateId = event.transaction.hash
    .concatI32(event.logIndex.toI32())
    .toHex();

  let merkleRootUpdate = new MerkleRootUpdate(updateId);
  merkleRootUpdate.airdrop = airdrop.id;
  merkleRootUpdate.updater = fetchAccount(event.transaction.from).id;
  merkleRootUpdate.oldRoot = oldRoot;
  merkleRootUpdate.newRoot = newRoot;
  merkleRootUpdate.timestamp = event.block.timestamp;
  merkleRootUpdate.txHash = event.transaction.hash;
  merkleRootUpdate.blockNumber = event.block.number;
  merkleRootUpdate.logIndex = event.logIndex;
  merkleRootUpdate.save();

  // Update airdrop with new merkle root
  airdrop.merkleRoot = newRoot;
  airdrop.save();
}

// Handler for DistributionCapUpdated event
export function handleDistributionCapUpdated(
  event: DistributionCapUpdated
): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping DistributionCapUpdated event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let oldCap = event.params.oldCap;
  let newCap = event.params.newCap;

  log.info(
    "DistributionCapUpdated event processed: Airdrop {}, OldCap {}, NewCap {}",
    [airdropAddress.toHex(), oldCap.toString(), newCap.toString()]
  );

  airdrop.distributionCap = newCap;
  airdrop.save();
}
