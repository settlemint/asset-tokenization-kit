import { Address, ByteArray, Bytes, crypto, log } from '@graphprotocol/graph-ts';
import { Approval, RoleAdminChanged, RoleGranted, RoleRevoked, Transfer } from '../../generated/templates/Bond/Bond';
import { fetchAccount } from '../fetch/account';
import { fetchAssetBalance } from '../fetch/balance';
import { toDecimals } from '../utils/decimals';
import { AssetType } from '../utils/enums';
import { eventId } from '../utils/events';
import { approvalEvent } from './events/approval';
import { burnEvent } from './events/burn';
import { mintEvent } from './events/mint';
import { roleAdminChangedEvent } from './events/roleadminchanged';
import { roleGrantedEvent } from './events/rolegranted';
import { roleRevokedEvent } from './events/rolerevoked';
import { transferEvent } from './events/transfer';
import { fetchBond } from './fetch/bond';
import { newAssetStatsData } from './stats/assets';
import { newPortfolioStatsData } from './stats/portfolio';

export function handleTransfer(event: Transfer): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);

  const assetStats = newAssetStatsData(bond.id, AssetType.bond);

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      to.id,
      event.params.value,
      bond.decimals
    );

    log.info('Bond mint event: amount={}, to={}, sender={}, bond={}', [
      mint.value.toString(),
      mint.to.toHexString(),
      mint.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // increase total supply
    bond.totalSupplyExact = bond.totalSupplyExact.plus(mint.valueExact);
    bond.totalSupply = toDecimals(bond.totalSupplyExact, bond.decimals);

    const balance = fetchAssetBalance(bond.id, to.id, bond.decimals);
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, bond.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(to.id, bond.id, AssetType.bond);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, bond.decimals);
    assetStats.mintedExact = event.params.value;
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);
    const burn = burnEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      from.id,
      event.params.value,
      bond.decimals
    );

    log.info('Bond burn event: amount={}, from={}, sender={}, bond={}', [
      burn.value.toString(),
      burn.from.toHexString(),
      burn.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // decrease total supply
    bond.totalSupplyExact = bond.totalSupplyExact.minus(burn.valueExact);
    bond.totalSupply = toDecimals(bond.totalSupplyExact, bond.decimals);

    const balance = fetchAssetBalance(bond.id, from.id, bond.decimals);
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, bond.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(from.id, bond.id, AssetType.bond);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, bond.decimals);
    assetStats.burnedExact = event.params.value;
  } else {
    // This will only execute for regular transfers (both addresses non-zero)
    const from = fetchAccount(event.params.from);
    const to = fetchAccount(event.params.to);
    const transfer = transferEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      from.id,
      to.id,
      event.params.value,
      bond.decimals
    );

    log.info('Bond transfer event: amount={}, from={}, to={}, sender={}, bond={}', [
      transfer.value.toString(),
      transfer.from.toHexString(),
      transfer.to.toHexString(),
      transfer.sender.toHexString(),
      event.address.toHexString(),
    ]);

    const fromBalance = fetchAssetBalance(bond.id, from.id, bond.decimals);
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, bond.decimals);
    fromBalance.save();

    const fromPortfolioStats = newPortfolioStatsData(from.id, bond.id, AssetType.bond);
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(bond.id, to.id, bond.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, bond.decimals);
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(to.id, bond.id, AssetType.bond);
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
  }

  bond.save();

  assetStats.supply = bond.totalSupply;
  assetStats.supplyExact = bond.totalSupplyExact;
  assetStats.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const bond = fetchBond(event.address);
  const account = fetchAccount(event.params.account);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    fetchAccount(event.transaction.from).id,
    event.params.role,
    account.id
  );

  log.info('Bond role granted event: role={}, account={}, bond={}', [
    roleGranted.role.toHexString(),
    roleGranted.account.toHexString(),
    event.address.toHexString(),
  ]);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < bond.admins.length; i++) {
      if (bond.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      bond.admins = bond.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < bond.supplyManagers.length; i++) {
      if (bond.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      bond.supplyManagers = bond.supplyManagers.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < bond.userManagers.length; i++) {
      if (bond.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      bond.userManagers = bond.userManagers.concat([account.id]);
    }
  }

  bond.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const bond = fetchBond(event.address);
  const account = fetchAccount(event.params.account);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    fetchAccount(event.transaction.from).id,
    event.params.role,
    account.id
  );

  log.info('Bond role revoked event: role={}, account={}, bond={}', [
    roleRevoked.role.toHexString(),
    roleRevoked.account.toHexString(),
    event.address.toHexString(),
  ]);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < bond.admins.length; i++) {
      if (!bond.admins[i].equals(account.id)) {
        newAdmins.push(bond.admins[i]);
      }
    }
    bond.admins = newAdmins;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < bond.supplyManagers.length; i++) {
      if (!bond.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(bond.supplyManagers[i]);
      }
    }
    bond.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < bond.userManagers.length; i++) {
      if (!bond.userManagers[i].equals(account.id)) {
        newUserManagers.push(bond.userManagers[i]);
      }
    }
    bond.userManagers = newUserManagers;
  }

  bond.save();
}

export function handleApproval(event: Approval): void {
  const bond = fetchBond(event.address);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);

  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(bond.id, owner.id, bond.decimals);
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(event.params.value, bond.decimals);
  ownerBalance.save();

  const approval = approvalEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    fetchAccount(event.transaction.from).id,
    owner.id,
    spender.id,
    event.params.value,
    bond.decimals
  );

  log.info('Bond approval event: amount={}, owner={}, spender={}, bond={}', [
    approval.value.toString(),
    approval.owner.toHexString(),
    approval.spender.toHexString(),
    event.address.toHexString(),
  ]);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const bond = fetchBond(event.address);

  const roleAdminChanged = roleAdminChangedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    fetchAccount(event.transaction.from).id,
    event.params.role,
    event.params.previousAdminRole,
    event.params.newAdminRole
  );

  log.info('Bond role admin changed event: role={}, previousAdminRole={}, newAdminRole={}, bond={}', [
    roleAdminChanged.role.toHexString(),
    roleAdminChanged.previousAdminRole.toHexString(),
    roleAdminChanged.newAdminRole.toHexString(),
    event.address.toHexString(),
  ]);
}
