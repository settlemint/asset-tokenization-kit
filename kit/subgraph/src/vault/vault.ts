import { BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";
import {
  VaultContractCallTransaction,
  VaultERC20Transaction,
  VaultNativeCurrencyTransaction,
  VaultTransactionConfirmation,
} from "../../generated/schema";
import {
  RoleGranted,
  RoleRevoked,
} from "../../generated/templates/Deposit/Deposit";
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
} from "../../generated/templates/Vault/Vault";
import { fetchAssetDecimals } from "../assets/fetch/asset";
import { fetchAccount } from "../fetch/account";
import { toDecimals } from "../utils/decimals";
import { EventName, Role } from "../utils/enums";
import { createEvent } from "../utils/events";
import { transactionId } from "./fetch/transaction";
import { fetchVault } from "./fetch/vault";

export function handlePaused(event: Paused): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.account);

  vault.paused = true;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.Paused,
    sender,
    [sender, vaultAccount],
    `{"account": "${event.params.account.toHex()}"}`
  );
}

export function handleUnpaused(event: Unpaused): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.account);

  vault.paused = false;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.Unpaused,
    sender,
    [sender, vaultAccount],
    `{"account": "${event.params.account.toHex()}"}`
  );
}

export function handleDeposit(event: Deposit): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.sender);

  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.Deposit,
    sender,
    [sender, vaultAccount],
    `{"sender": "${event.params.sender.toHex()}", "value": "${event.params.value.toString()}", "balance": "${event.params.balance.toString()}"}`
  );
}

export function handleRequirementChanged(event: RequirementChanged): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.account);

  vault.requiredSigners = event.params.required;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.RequirementChanged,
    sender,
    [sender, vaultAccount],
    `{"account": "${event.params.account.toHex()}", "required": "${event.params.required.toString()}"}`
  );
}

export function handleRoleGranted(event: RoleGranted): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.sender);
  const account = fetchAccount(event.params.account);

  // Handle different roles
  if (event.params.role.toHexString() == Role.DEFAULT_ADMIN_ROLE) {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < vault.admins.length; i++) {
      if (vault.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      vault.admins = vault.admins.concat([account.id]);

      createEvent(
        event,
        EventName.RoleGranted,
        sender,
        [sender, vaultAccount, account],
        `{"sender": "${event.params.sender.toHex()}", "account": "${event.params.account.toHex()}", "role": "DEFAULT_ADMIN_ROLE"}`
      );
    }
  } else if (event.params.role.toHexString() == Role.SIGNER_ROLE) {
    // SIGNER_ROLE
    let found = false;
    for (let i = 0; i < vault.signers.length; i++) {
      if (vault.signers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      vault.signers = vault.signers.concat([account.id]);

      createEvent(
        event,
        EventName.RoleGranted,
        sender,
        [sender, vaultAccount, account],
        `{"sender": "${event.params.sender.toHex()}", "account": "${event.params.account.toHex()}", "role": "SIGNER_ROLE"}`
      );
    }
  }

  vault.totalSigners = BigInt.fromI32(vault.signers.length);
  vault.lastActivity = event.block.timestamp;
  vault.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.sender);
  const account = fetchAccount(event.params.account);

  // Handle different roles
  if (event.params.role.toHexString() == Role.DEFAULT_ADMIN_ROLE) {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < vault.admins.length; i++) {
      if (!vault.admins[i].equals(account.id)) {
        newAdmins.push(vault.admins[i]);
      }
    }
    vault.admins = newAdmins;

    createEvent(
      event,
      EventName.RoleRevoked,
      sender,
      [sender, vaultAccount, account],
      `{"sender": "${event.params.sender.toHex()}", "account": "${event.params.account.toHex()}", "role": "DEFAULT_ADMIN_ROLE"}`
    );
  } else if (event.params.role.toHexString() == Role.SIGNER_ROLE) {
    // SIGNER_ROLE
    const newSigners: Bytes[] = [];
    for (let i = 0; i < vault.signers.length; i++) {
      if (!vault.signers[i].equals(account.id)) {
        newSigners.push(vault.signers[i]);
      }
    }
    vault.signers = newSigners;

    createEvent(
      event,
      EventName.RoleRevoked,
      sender,
      [sender, vaultAccount, account],
      `{"sender": "${event.params.sender.toHex()}", "account": "${event.params.account.toHex()}", "role": "SIGNER_ROLE"}`
    );
  }

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
  const vaultAccount = fetchAccount(event.address);
  const submitter = fetchAccount(event.params.signer); // Signer who submitted
  const toAccount = fetchAccount(event.params.to);

  const tx = new VaultNativeCurrencyTransaction(
    transactionId(vault, event.params.txIndex)
  );

  tx.vault = vault.id;
  tx.txIndex = event.params.txIndex;
  tx.type = "Native Currency";
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

  createEvent(
    event,
    EventName.SubmitTransaction,
    submitter,
    [submitter, vaultAccount, toAccount],
    `{"signer": "${submitter.id.toHex()}", "txIndex": ${tx.txIndex.toString()}, "to": "${toAccount.id.toHex()}", "valueExact": "${tx.valueExact.toString()}", "value": "${tx.value.toString()}", "data": "${tx.data.toHex()}", "comment": "${tx.comment}"}`
  );
}

// ERC20 Transfer Transaction Submission
export function handleSubmitERC20TransferTransaction(
  event: SubmitERC20TransferTransaction
): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.transaction.from); // Actual tx sender
  const submitter = fetchAccount(event.params.signer); // Signer who submitted
  const toAccount = fetchAccount(event.params.to);
  const tokenAsset = fetchAccount(event.params.token);

  const decimals = fetchAssetDecimals(event.params.token);

  const tx = new VaultERC20Transaction(
    transactionId(vault, event.params.txIndex)
  );

  tx.vault = vault.id;
  tx.txIndex = event.params.txIndex;
  tx.type = "Asset Transfer";
  tx.submitter = submitter.id;
  tx.createdAt = event.block.timestamp;
  tx.comment = event.params.comment;
  tx.executed = false;
  tx.confirmationsCount = 0;
  tx.token = tokenAsset.id;
  tx.to = toAccount.id;
  tx.amountExact = event.params.amount;
  tx.amount = toDecimals(event.params.amount, decimals);
  tx.save();

  vault.pendingTransactionsCount = vault.pendingTransactionsCount + 1;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.SubmitERC20TransferTransaction,
    sender,
    [sender, vaultAccount, submitter, toAccount, tokenAsset],
    `{"signer": "${submitter.id.toHex()}", "txIndex": ${tx.txIndex.toString()}, "token": "${tokenAsset.id.toHex()}", "to": "${toAccount.id.toHex()}", "amount": "${tx.amountExact.toString()}", "comment": "${tx.comment}"}`
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

  const tx = new VaultContractCallTransaction(
    transactionId(vault, event.params.txIndex)
  );

  tx.vault = vault.id;
  tx.txIndex = event.params.txIndex;
  tx.type = "Contract Call";
  tx.submitter = submitter.id;
  tx.createdAt = event.block.timestamp;
  tx.comment = event.params.comment;
  tx.executed = false;
  tx.confirmationsCount = 0;
  tx.target = targetAccount.id;
  tx.value = toDecimals(event.params.value, 18);
  tx.valueExact = event.params.value;
  tx.selector = event.params.selector;
  tx.abiEncodedArguments = event.params.abiEncodedArguments;
  tx.save();

  vault.pendingTransactionsCount = vault.pendingTransactionsCount + 1;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.SubmitContractCallTransaction,
    sender,
    [sender, vaultAccount, submitter, targetAccount],
    `{"signer": "${submitter.id.toHex()}", "txIndex": ${tx.txIndex.toString()}, "target": "${targetAccount.id.toHex()}", "value": "${tx.value.toString()}", "selector": "${tx.selector.toHex()}", "abiEncodedArguments": "${tx.abiEncodedArguments.toHex()}", "comment": "${tx.comment}"}`
  );
}

// Transaction Confirmation
export function handleConfirmTransaction(event: ConfirmTransaction): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.transaction.from); // Actual tx sender
  const signer = fetchAccount(event.params.signer); // Signer confirming

  const txId = vault.id
    .toHex()
    .concat("-")
    .concat(event.params.txIndex.toString());

  // We need to load the specific transaction type to update its confirmation count.
  // Try loading each type. This isn't ideal, but necessary without a direct interface load.
  let txGeneral = VaultNativeCurrencyTransaction.load(Bytes.fromUTF8(txId));
  if (txGeneral) {
    txGeneral.confirmationsCount = txGeneral.confirmationsCount + 1;
    txGeneral.save();
  } else {
    let txERC20 = VaultERC20Transaction.load(Bytes.fromUTF8(txId));
    if (txERC20) {
      txERC20.confirmationsCount = txERC20.confirmationsCount + 1;
      txERC20.save();
    } else {
      let txContractCall = VaultContractCallTransaction.load(
        Bytes.fromUTF8(txId)
      );
      if (txContractCall) {
        txContractCall.confirmationsCount =
          txContractCall.confirmationsCount + 1;
        txContractCall.save();
      } else {
        log.error("[Vault][handleConfirmTx] Transaction not found for ID: {}", [
          txId,
        ]);
        return; // Exit if transaction doesn't exist
      }
    }
  }

  const confirmationId = txId.concat("-").concat(signer.id.toHex());
  let confirmation = VaultTransactionConfirmation.load(
    Bytes.fromUTF8(confirmationId)
  );
  if (!confirmation) {
    confirmation = new VaultTransactionConfirmation(
      Bytes.fromUTF8(confirmationId)
    );
    confirmation.transaction = Bytes.fromUTF8(txId); // Use the ID string directly
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

  createEvent(
    event,
    EventName.ConfirmTransaction,
    sender,
    [sender, vaultAccount, signer],
    `{"signer": "${signer.id.toHex()}", "txIndex": ${event.params.txIndex.toString()}}`
  );
}

// Revoke Confirmation
export function handleRevokeConfirmation(event: RevokeConfirmation): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.transaction.from); // Actual tx sender
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
    let txGeneral = VaultNativeCurrencyTransaction.load(Bytes.fromUTF8(txId));
    if (txGeneral) {
      txGeneral.confirmationsCount = txGeneral.confirmationsCount - 1;
      txGeneral.save();
    } else {
      let txERC20 = VaultERC20Transaction.load(Bytes.fromUTF8(txId));
      if (txERC20) {
        txERC20.confirmationsCount = txERC20.confirmationsCount - 1;
        txERC20.save();
      } else {
        let txContractCall = VaultContractCallTransaction.load(
          Bytes.fromUTF8(txId)
        );
        if (txContractCall) {
          txContractCall.confirmationsCount =
            txContractCall.confirmationsCount - 1;
          txContractCall.save();
        } else {
          log.error(
            "[Vault][handleRevokeConfirm] Transaction not found for ID: {}",
            [txId]
          );
          // Don't return here, still log the event
        }
      }
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

  createEvent(
    event,
    EventName.RevokeConfirmation,
    sender,
    [sender, vaultAccount, signer],
    `{"signer": "${signer.id.toHex()}", "txIndex": ${event.params.txIndex.toString()}}`
  );
}

// Execute Transaction
export function handleExecuteTransaction(event: ExecuteTransaction): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.transaction.from); // Actual tx sender
  const executor = fetchAccount(event.params.signer); // Signer executing

  const txId = vault.id
    .toHex()
    .concat("-")
    .concat(event.params.txIndex.toString());

  let txType = "";
  let txSubmitter = Bytes.empty(); // Placeholder

  // Load the specific transaction type and update its status
  let txGeneral = VaultNativeCurrencyTransaction.load(Bytes.fromUTF8(txId));
  if (txGeneral) {
    txGeneral.executed = true;
    txGeneral.executedAt = event.block.timestamp;
    txGeneral.executor = executor.id;
    txSubmitter = txGeneral.submitter;
    txType = txGeneral.type;
    txGeneral.save();
  } else {
    let txERC20 = VaultERC20Transaction.load(Bytes.fromUTF8(txId));
    if (txERC20) {
      txERC20.executed = true;
      txERC20.executedAt = event.block.timestamp;
      txERC20.executor = executor.id;
      txSubmitter = txERC20.submitter;
      txType = txERC20.type;
      txERC20.save();
    } else {
      let txContractCall = VaultContractCallTransaction.load(
        Bytes.fromUTF8(txId)
      );
      if (txContractCall) {
        txContractCall.executed = true;
        txContractCall.executedAt = event.block.timestamp;
        txContractCall.executor = executor.id;
        txSubmitter = txContractCall.submitter;
        txType = txContractCall.type;
        txContractCall.save();
      } else {
        log.error("[Vault][handleExecuteTx] Transaction not found for ID: {}", [
          txId,
        ]);
        return; // Exit if transaction doesn't exist
      }
    }
  }

  // Update vault counters only if the transaction was found and updated
  vault.pendingTransactionsCount = vault.pendingTransactionsCount - 1;
  vault.executedTransactionsCount = vault.executedTransactionsCount + 1;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.ExecuteTransaction,
    sender,
    [sender, vaultAccount, executor],
    `{"signer": "${executor.id.toHex()}", "txIndex": ${event.params.txIndex.toString()}, "type": "${txType}"}`
  );
}
