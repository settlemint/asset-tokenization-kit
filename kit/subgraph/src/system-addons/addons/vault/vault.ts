import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import type {
  ConfirmTransaction,
  Deposit,
  ExecuteTransaction,
  RequirementChanged,
  RevokeConfirmation,
  SubmitContractCallTransaction,
  SubmitERC20TransferTransaction,
  SubmitTransaction,
  TransactionExecutionFailed,
} from '../../../../generated/templates/Vault/Vault';
import { fetchEvent } from '../../../event/fetch/event';
import { fetchVault } from './fetch/vault';
import { fetchVaultTransaction } from './fetch/vault-transaction';

export function handleDeposit(event: Deposit): void {
  fetchEvent(event, 'Deposit');

  const vault = fetchVault(event.address);
  vault.balance = BigDecimal.fromString(event.params.balance.toString()).div(
    BigDecimal.fromString('1000000000000000000')
  );
  vault.balanceExact = event.params.balance;
  vault.save();
}

export function handleSubmitTransaction(event: SubmitTransaction): void {
  fetchEvent(event, 'SubmitTransaction');

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.to = event.params.to;
  transaction.value = BigDecimal.fromString(event.params.value.toString()).div(
    BigDecimal.fromString('1000000000000000000')
  );
  transaction.valueExact = event.params.value;
  transaction.data = event.params.data;
  transaction.comment = event.params.comment;
  transaction.submittedBy = event.params.signer;
  transaction.submittedAt = event.block.timestamp;
  transaction.deployedInTransaction = event.transaction.hash;
  transaction.save();
}

export function handleSubmitERC20TransferTransaction(
  event: SubmitERC20TransferTransaction
): void {
  fetchEvent(event, 'SubmitERC20TransferTransaction');

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.to = event.params.to;
  transaction.comment = event.params.comment;
  transaction.submittedBy = event.params.signer;
  transaction.submittedAt = event.block.timestamp;
  transaction.deployedInTransaction = event.transaction.hash;

  // Create ERC20Transfer entity
  // TODO: Implement ERC20Transfer entity creation

  transaction.save();
}

export function handleSubmitContractCallTransaction(
  event: SubmitContractCallTransaction
): void {
  fetchEvent(event, 'SubmitContractCallTransaction');

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.to = event.params.target;
  transaction.value = BigDecimal.fromString(event.params.value.toString()).div(
    BigDecimal.fromString('1000000000000000000')
  );
  transaction.valueExact = event.params.value;
  // Combine selector and abiEncodedArguments for the data field
  transaction.data = event.params.selector.concat(
    event.params.abiEncodedArguments
  );
  transaction.comment = event.params.comment;
  transaction.submittedBy = event.params.signer;
  transaction.submittedAt = event.block.timestamp;
  transaction.deployedInTransaction = event.transaction.hash;

  // Create ContractCall entity
  // TODO: Implement ContractCall entity creation

  transaction.save();
}

export function handleConfirmTransaction(event: ConfirmTransaction): void {
  fetchEvent(event, 'ConfirmTransaction');

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.confirmationsCount = transaction.confirmationsCount.plus(
    BigInt.fromI32(1)
  );
  transaction.save();

  // TODO: Create or update VaultTransactionConfirmation entity
}

export function handleRevokeConfirmation(event: RevokeConfirmation): void {
  fetchEvent(event, 'RevokeConfirmation');

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.confirmationsCount = transaction.confirmationsCount.minus(
    BigInt.fromI32(1)
  );
  transaction.save();

  // TODO: Update VaultTransactionConfirmation entity
}

export function handleExecuteTransaction(event: ExecuteTransaction): void {
  fetchEvent(event, 'ExecuteTransaction');

  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.executed = true;
  transaction.executedAt = event.block.timestamp;
  transaction.executedBy = event.params.signer;
  transaction.save();
}

export function handleRequirementChanged(event: RequirementChanged): void {
  fetchEvent(event, 'RequirementChanged');

  const vault = fetchVault(event.address);
  vault.required = event.params.required;
  vault.save();
}

export function handleTransactionExecutionFailed(
  event: TransactionExecutionFailed
): void {
  fetchEvent(event, 'TransactionExecutionFailed');

  // Log the failed execution - transaction entity already exists
  const transaction = fetchVaultTransaction(
    event.address,
    event.params.txIndex
  );
  transaction.executed = false; // Ensure it's marked as not executed
  transaction.save();
}
