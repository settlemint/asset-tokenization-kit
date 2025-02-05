import { Address, ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts';
import { RoleGranted, RoleRevoked, Transfer } from '../../generated/templates/Fund/Fund';
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
import { fetchFund } from './fetch/fund';
import { newAssetStatsData } from './stats/assets';
import { newPortfolioStatsData } from './stats/portfolio';

export function handleTransfer(event: Transfer): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  const assetStats = newAssetStatsData(fund.id, AssetType.fund, fund.fundCategory, fund.fundClass);

  if (event.params.from === Address.zero()) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      to.id,
      event.params.value,
      fund.decimals
    );

    // increase total supply
    fund.totalSupplyExact = fund.totalSupplyExact.plus(mint.valueExact);
    fund.totalSupply = toDecimals(fund.totalSupplyExact, fund.decimals);

    const balance = fetchAssetBalance(fund.id, to.id, fund.decimals);
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, fund.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(to.id, fund.id, AssetType.fund);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, fund.decimals);
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
      fund.decimals
    );

    // decrease total supply
    fund.totalSupplyExact = fund.totalSupplyExact.minus(burn.valueExact);
    fund.totalSupply = toDecimals(fund.totalSupplyExact, fund.decimals);

    const balance = fetchAssetBalance(fund.id, from.id, fund.decimals);
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, fund.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(from.id, fund.id, AssetType.fund);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, fund.decimals);
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
      fund.decimals
    );

    const fromBalance = fetchAssetBalance(fund.id, from.id, fund.decimals);
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, fund.decimals);
    fromBalance.save();

    const fromPortfolioStats = newPortfolioStatsData(from.id, fund.id, AssetType.fund);
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(fund.id, to.id, fund.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, fund.decimals);
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(to.id, fund.id, AssetType.fund);
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
  }

  fund.save();

  assetStats.supply = fund.totalSupply;
  assetStats.supplyExact = fund.totalSupplyExact;
  assetStats.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const account = fetchAccount(event.params.account);

  roleGrantedEvent(eventId(event), event.block.timestamp, event.address, sender.id, event.params.role, account.id);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    if (!fund.admins.includes(account.id)) {
      fund.admins.push(account.id);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    if (!fund.supplyManagers.includes(account.id)) {
      fund.supplyManagers.push(account.id);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    if (!fund.userManagers.includes(account.id)) {
      fund.userManagers.push(account.id);
    }
  }

  fund.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const account = fetchAccount(event.params.account);

  roleRevokedEvent(eventId(event), event.block.timestamp, event.address, sender.id, event.params.role, account.id);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < fund.admins.length; i++) {
      if (fund.admins[i] != account.id) {
        newAdmins.push(fund.admins[i]);
      }
    }
    fund.admins = newAdmins;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < fund.supplyManagers.length; i++) {
      if (fund.supplyManagers[i] != account.id) {
        newSupplyManagers.push(fund.supplyManagers[i]);
      }
    }
    fund.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < fund.userManagers.length; i++) {
      if (fund.userManagers[i] != account.id) {
        newUserManagers.push(fund.userManagers[i]);
      }
    }
    fund.userManagers = newUserManagers;
  }

  fund.save();
}
