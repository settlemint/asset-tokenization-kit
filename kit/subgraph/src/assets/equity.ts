import { Address, ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts';
import { RoleGranted, RoleRevoked, Transfer } from '../../generated/templates/Equity/Equity';
import { fetchAccount } from '../fetch/account';
import { fetchAssetBalance } from '../fetch/balance';
import { toDecimals } from '../utils/decimals';
import { AssetType } from '../utils/enums';
import { eventId } from '../utils/events';
import { burnEvent } from './events/burn';
import { mintEvent } from './events/mint';
import { roleGrantedEvent } from './events/rolegranted';
import { roleRevokedEvent } from './events/rolerevoked';
import { transferEvent } from './events/transfer';
import { fetchEquity } from './fetch/equity';
import { newAssetStatsData } from './stats/assets';
import { newPortfolioStatsData } from './stats/portfolio';

export function handleTransfer(event: Transfer): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);

  const assetStats = newAssetStatsData(equity.id, AssetType.equity, equity.equityCategory, equity.equityClass);

  if (event.params.from === Address.zero()) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      to.id,
      event.params.value,
      equity.decimals
    );

    // increase total supply
    equity.totalSupplyExact = equity.totalSupplyExact.plus(mint.valueExact);
    equity.totalSupply = toDecimals(equity.totalSupplyExact, equity.decimals);

    const balance = fetchAssetBalance(equity.id, to.id, equity.decimals);
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, equity.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(to.id, equity.id, AssetType.equity);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, equity.decimals);
    assetStats.mintedExact = event.params.value;
  }

  if (event.params.to === Address.zero()) {
    const from = fetchAccount(event.params.from);
    const burn = burnEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      from.id,
      event.params.value,
      equity.decimals
    );

    // decrease total supply
    equity.totalSupplyExact = equity.totalSupplyExact.minus(burn.valueExact);
    equity.totalSupply = toDecimals(equity.totalSupplyExact, equity.decimals);

    const balance = fetchAssetBalance(equity.id, from.id, equity.decimals);
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, equity.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(from.id, equity.id, AssetType.equity);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, equity.decimals);
    assetStats.burnedExact = event.params.value;
  }

  if (event.params.from !== Address.zero() && event.params.to !== Address.zero()) {
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
      equity.decimals
    );

    const fromBalance = fetchAssetBalance(equity.id, from.id, equity.decimals);
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, equity.decimals);
    fromBalance.save();

    const fromPortfolioStats = newPortfolioStatsData(from.id, equity.id, AssetType.equity);
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(equity.id, to.id, equity.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, equity.decimals);
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(to.id, equity.id, AssetType.equity);
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
  }

  equity.save();

  assetStats.supply = equity.totalSupply;
  assetStats.supplyExact = equity.totalSupplyExact;
  assetStats.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const account = fetchAccount(event.params.account);

  roleGrantedEvent(eventId(event), event.block.timestamp, event.address, sender.id, event.params.role, account.id);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    if (!equity.admins.includes(account.id)) {
      equity.admins.push(account.id);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    if (!equity.supplyManagers.includes(account.id)) {
      equity.supplyManagers.push(account.id);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    if (!equity.userManagers.includes(account.id)) {
      equity.userManagers.push(account.id);
    }
  }

  equity.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const account = fetchAccount(event.params.account);

  roleRevokedEvent(eventId(event), event.block.timestamp, event.address, sender.id, event.params.role, account.id);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < equity.admins.length; i++) {
      if (equity.admins[i] != account.id) {
        newAdmins.push(equity.admins[i]);
      }
    }
    equity.admins = newAdmins;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < equity.supplyManagers.length; i++) {
      if (equity.supplyManagers[i] != account.id) {
        newSupplyManagers.push(equity.supplyManagers[i]);
      }
    }
    equity.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < equity.userManagers.length; i++) {
      if (equity.userManagers[i] != account.id) {
        newUserManagers.push(equity.userManagers[i]);
      }
    }
    equity.userManagers = newUserManagers;
  }

  equity.save();
}
