import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Deposit,
  ExecuteTransaction,
  RequirementChanged,
  SubmitTransactionWithSignatures,
  WeightedSignaturesToggled,
  SignerWeightUpdated,
  SignaturesProvided,
  OnchainIdSet,
} from "../../../../generated/templates/Vault/Vault";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchVault } from "./fetch/vault";
import { fetchVaultTransaction } from "./fetch/vault-transaction";
import { fetchVaultSigner } from "./fetch/vault-signer";
import { fetchVaultTransactionConfirmation } from "./fetch/vault-transaction-confirmation";
import { fetchAccount } from "../../../account/fetch/account";

export function handleDeposit(event: Deposit): void {
  fetchEvent(event, "Deposit");

  const vault = fetchVault(event.address);
  vault.balance = BigDecimal.fromString(event.params.balance.toString()).div(
    BigDecimal.fromString("1000000000000000000")
  );
  vault.balanceExact = event.params.balance;
  vault.save();
}

export function handleSubmitTransactionWithSignatures(
  event: SubmitTransactionWithSignatures
): void {
  fetchEvent(event, "SubmitTransactionWithSignatures");

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.to = event.params.to;
  transaction.value = BigDecimal.fromString(event.params.value.toString()).div(
    BigDecimal.fromString("1000000000000000000")
  );
  transaction.valueExact = event.params.value;
  transaction.data = event.params.data;
  transaction.comment = event.params.comment;
  transaction.submittedBy = event.params.submitter;
  transaction.submittedAt = event.block.timestamp;
  transaction.confirmationsRequired = event.params.requiredSignatures;
  transaction.deployedInTransaction = event.transaction.hash;
  transaction.save();
}

export function handleWeightedSignaturesToggled(
  event: WeightedSignaturesToggled
): void {
  fetchEvent(event, "WeightedSignaturesToggled");

  const vault = fetchVault(event.address);
  vault.weightedSignaturesEnabled = event.params.enabled;
  vault.save();
}

export function handleSignerWeightUpdated(event: SignerWeightUpdated): void {
  fetchEvent(event, "SignerWeightUpdated");

  const vaultSigner = fetchVaultSigner(event.address, event.params.signer);
  vaultSigner.weight = event.params.weight;
  vaultSigner.deployedInTransaction = event.transaction.hash;
  vaultSigner.save();
}

export function handleExecuteTransaction(event: ExecuteTransaction): void {
  fetchEvent(event, "ExecuteTransaction");

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.executed = true;
  transaction.executedAt = event.block.timestamp;
  transaction.executedBy = event.params.executor;
  transaction.save();
}

export function handleRequirementChanged(event: RequirementChanged): void {
  fetchEvent(event, "RequirementChanged");

  const vault = fetchVault(event.address);
  vault.required = event.params.required;
  vault.save();
}

export function handleSignaturesProvided(event: SignaturesProvided): void {
  fetchEvent(event, "SignaturesProvided");

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );

  // Update the confirmation count on the transaction
  transaction.confirmationsCount = event.params.signatureCount;

  // Create confirmation records for each signer
  for (let i = 0; i < event.params.signerAddresses.length; i++) {
    const confirmation = fetchVaultTransactionConfirmation(
      event.address,
      event.params.txIndex,
      event.params.signerAddresses[i]
    );
    confirmation.confirmed = true;
    confirmation.confirmedAt = event.block.timestamp;
    confirmation.deployedInTransaction = event.transaction.hash;
    confirmation.save();
  }

  transaction.save();
}

export function handleOnchainIdSet(event: OnchainIdSet): void {
  fetchEvent(event, "OnchainIdSet");

  const vault = fetchVault(event.address);
  vault.onchainId = fetchAccount(event.params.onchainId).id;
  vault.save();
}
