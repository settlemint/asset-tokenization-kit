import { BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";
import {
  VaultTransaction,
  VaultTransactionConfirmation,
} from "../../../generated/schema";
import {
  RoleGranted,
  RoleRevoked,
} from "../../../generated/templates/Deposit/Deposit";
import {
  ConfirmTransaction,
  Deposit,
  ExecuteTransaction,
  Paused,
  RequirementChanged,
  RevokeConfirmation,
  SubmitContractCallTransaction,
  SubmitERC20TransferTransaction,
  SubmitTransaction,
  Unpaused,
} from "../../../generated/templates/Vault/Vault";
import { fetchAssetDecimals } from "../assets/fetch/asset";
import { roleGrantedHandler } from "../assets/handlers/role-granted";
import { roleRevokedHandler } from "../assets/handlers/role-revoked";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { toDecimals } from "../utils/decimals";
import { VaultTransactionType } from "../utils/enums";
import { transactionId } from "./fetch/transaction";
import { fetchVault } from "./fetch/vault";

export function handlePaused(event: Paused): void {
  const vault = fetchVault(event.address, event.block.timestamp);

  vault.paused = true;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(event, EventType.Pause, event.params.account, [
    event.params.account,
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  const vault = fetchVault(event.address, event.block.timestamp);

  vault.paused = false;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(event, EventType.Unpause, event.params.account, [
    event.params.account,
  ]);
}

export function handleDeposit(event: Deposit): void {
  const vault = fetchVault(event.address, event.block.timestamp);

  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(event, EventType.Deposit, event.params.sender, [
    event.params.sender,
  ]);
}

export function handleRequirementChanged(event: RequirementChanged): void {
  const vault = fetchVault(event.address, event.block.timestamp);

  vault.requiredSigners = event.params.required;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(
    event,
    EventType.RequirementChanged,
    event.params.account,
    [event.params.account]
  );
}

export function handleRoleGranted(event: RoleGranted): void {
  const vault = fetchVault(event.address, event.block.timestamp);

  roleGrantedHandler(
    event,
    vault,
    event.params.role.toHexString(),
    event.params.account,
    event.params.sender
  );

  vault.totalSigners = BigInt.fromI32(vault.signers.length);
  vault.lastActivity = event.block.timestamp;
  vault.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const vault = fetchVault(event.address, event.block.timestamp);

  roleRevokedHandler(
    event,
    vault,
    event.params.role.toHexString(),
    event.params.account,
    event.params.sender
  );

  vault.totalSigners = BigInt.fromI32(vault.signers.length);
  vault.lastActivity = event.block.timestamp;
  vault.save();
}

// --------------------------------------------------
// Vault Transaction Handlers
// --------------------------------------------------

// General Transaction Submission
export function handleSubmitTransaction(event: SubmitTransaction): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const submitter = fetchAccount(event.params.signer); // Signer who submitted
  const toAccount = fetchAccount(event.params.to);

  const tx = new VaultTransaction(transactionId(vault, event.params.txIndex));
  tx.vault = vault.id;
  tx.txIndex = event.params.txIndex;
  tx.type = VaultTransactionType.NativeCurrencyTransfer;
  tx.submitter = submitter.id;
  tx.createdAt = event.block.timestamp;
  tx.comment = event.params.comment;
  tx.executed = false;
  tx.confirmationsCount = 0; // Will be incremented by ConfirmTransaction
  tx.to = toAccount.id;
  tx.value = toDecimals(event.params.value, 18);
  tx.valueExact = event.params.value;
  tx.data = event.params.data;
  tx.save();

  vault.pendingTransactionsCount = vault.pendingTransactionsCount + 1;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(
    event,
    EventType.SubmitTransaction,
    event.params.signer,
    [event.params.signer, event.params.to]
  );
}

// ERC20 Transfer Transaction Submission
export function handleSubmitERC20TransferTransaction(
  event: SubmitERC20TransferTransaction
): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const submitter = fetchAccount(event.params.signer); // Signer who submitted
  const toAccount = fetchAccount(event.params.to);
  const tokenAsset = fetchAccount(event.params.token);

  const decimals = fetchAssetDecimals(event.params.token);

  const tx = new VaultTransaction(transactionId(vault, event.params.txIndex));

  tx.vault = vault.id;
  tx.txIndex = event.params.txIndex;
  tx.type = VaultTransactionType.ERC20Transfer;
  tx.submitter = submitter.id;
  tx.createdAt = event.block.timestamp;
  tx.comment = event.params.comment;
  tx.executed = false;
  tx.confirmationsCount = 0;
  tx.token = tokenAsset.id;
  tx.to = toAccount.id;
  tx.valueExact = event.params.amount;
  tx.value = toDecimals(event.params.amount, decimals);
  tx.save();

  vault.pendingTransactionsCount = vault.pendingTransactionsCount + 1;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(
    event,
    EventType.SubmitERC20TransferTransaction,
    event.params.signer,
    [event.params.signer, event.params.to, event.params.token]
  );
}

// Contract Call Transaction Submission
export function handleSubmitContractCallTransaction(
  event: SubmitContractCallTransaction
): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.transaction.from); // Actual tx sender
  const submitter = fetchAccount(event.params.signer); // Signer who submitted
  const targetAccount = fetchAccount(event.params.target);

  const tx = new VaultTransaction(transactionId(vault, event.params.txIndex));

  tx.vault = vault.id;
  tx.txIndex = event.params.txIndex;
  tx.type = VaultTransactionType.ContractCall;
  tx.submitter = submitter.id;
  tx.createdAt = event.block.timestamp;
  tx.comment = event.params.comment;
  tx.executed = false;
  tx.confirmationsCount = 0;
  tx.to = targetAccount.id;
  tx.value = toDecimals(event.params.value, 18);
  tx.valueExact = event.params.value;
  tx.selector = event.params.selector;
  tx.abiEncodedArguments = event.params.abiEncodedArguments;
  tx.save();

  vault.pendingTransactionsCount = vault.pendingTransactionsCount + 1;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(
    event,
    EventType.SubmitContractCallTransaction,
    event.params.signer,
    [event.params.signer, event.params.target]
  );
}

// Transaction Confirmation
export function handleConfirmTransaction(event: ConfirmTransaction): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const signer = fetchAccount(event.params.signer); // Signer confirming

  const txId = vault.id
    .toHex()
    .concat("-")
    .concat(event.params.txIndex.toString());

  // We need to load the specific transaction type to update its confirmation count.
  // Try loading each type. This isn't ideal, but necessary without a direct interface load.
  let tx = VaultTransaction.load(Bytes.fromUTF8(txId));
  if (tx) {
    tx.confirmationsCount = tx.confirmationsCount + 1;
    tx.save();
  } else {
    log.error("[Vault][handleConfirmTx] Transaction not found for ID: {}", [
      txId,
    ]);
    return; // Exit if transaction doesn't exist
  }

  const confirmationId = tx.id.concat(signer.id);
  let confirmation = VaultTransactionConfirmation.load(confirmationId);
  if (!confirmation) {
    confirmation = new VaultTransactionConfirmation(confirmationId);
    confirmation.transaction = tx.id; // Use the ID string directly
    confirmation.signer = signer.id;
    confirmation.confirmedAt = event.block.timestamp;
    confirmation.save();
  } else {
    // Already confirmed, maybe log a warning or ignore? Ignoring for now.
    log.warning(
      "[Vault][handleConfirmTx] Duplicate confirmation skipped for tx {}, signer {}",
      [txId, signer.id.toHex()]
    );
  }

  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(
    event,
    EventType.ConfirmTransaction,
    event.params.signer,
    [event.params.signer, event.params.signer]
  );
}

// Revoke Confirmation
export function handleRevokeConfirmation(event: RevokeConfirmation): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const signer = fetchAccount(event.params.signer); // Signer revoking

  const txId = vault.id
    .toHex()
    .concat("-")
    .concat(event.params.txIndex.toString());
  const confirmationId = txId.concat("-").concat(signer.id.toHex());

  // Check if confirmation exists before trying to remove
  const confirmation = VaultTransactionConfirmation.load(
    Bytes.fromUTF8(confirmationId)
  );
  if (confirmation) {
    store.remove("VaultTransactionConfirmation", confirmationId);

    // Decrement confirmation count on the transaction
    let tx = VaultTransaction.load(Bytes.fromUTF8(txId));
    if (tx) {
      tx.confirmationsCount = tx.confirmationsCount - 1;
      tx.save();
    } else {
      log.error(
        "[Vault][handleRevokeConfirm] Transaction not found for ID: {}",
        [txId]
      );
      // Don't return here, still log the event
    }
  } else {
    log.warning(
      "[Vault][handleRevokeConfirm] Confirmation not found for tx {}, signer {}",
      [txId, signer.id.toHex()]
    );
    // Don't return, still log the event
  }

  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(
    event,
    EventType.RevokeConfirmation,
    event.params.signer,
    [event.params.signer]
  );
}

// Execute Transaction
export function handleExecuteTransaction(event: ExecuteTransaction): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const executor = fetchAccount(event.params.signer); // Signer executing

  const txId = vault.id
    .toHex()
    .concat("-")
    .concat(event.params.txIndex.toString());

  let txType = "";
  let txSubmitter = Bytes.empty(); // Placeholder

  // Load the specific transaction type and update its status
  let tx = VaultTransaction.load(Bytes.fromUTF8(txId));
  if (tx) {
    tx.executed = true;
    tx.executedAt = event.block.timestamp;
    tx.executor = executor.id;
    tx.submitter = tx.submitter;
    tx.type = tx.type;
    tx.save();
  } else {
    log.error("[Vault][handleExecuteTx] Transaction not found for ID: {}", [
      txId,
    ]);
    return; // Exit if transaction doesn't exist
  }

  // Update vault counters only if the transaction was found and updated
  vault.pendingTransactionsCount = vault.pendingTransactionsCount - 1;
  vault.executedTransactionsCount = vault.executedTransactionsCount + 1;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createActivityLogEntry(
    event,
    EventType.ExecuteTransaction,
    event.params.signer,
    [event.params.signer]
  );
}
