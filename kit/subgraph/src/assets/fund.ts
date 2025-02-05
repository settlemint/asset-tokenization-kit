import { Address, ByteArray, Bytes, crypto, log } from '@graphprotocol/graph-ts';
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

  if (event.params.from.equals(Address.zero())) {
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

    log.info('Fund mint event: amount={}, to={}, sender={}, fund={}', [
      mint.value.toString(),
      mint.to.toHexString(),
      mint.sender.toHexString(),
      event.address.toHexString(),
    ]);

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
  } else if (event.params.to.equals(Address.zero())) {
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

    log.info('Fund burn event: amount={}, from={}, sender={}, fund={}', [
      burn.value.toString(),
      burn.from.toHexString(),
      burn.sender.toHexString(),
      event.address.toHexString(),
    ]);

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
      fund.decimals
    );

    log.info('Fund transfer event: amount={}, from={}, to={}, sender={}, fund={}', [
      transfer.value.toString(),
      transfer.from.toHexString(),
      transfer.to.toHexString(),
      transfer.sender.toHexString(),
      event.address.toHexString(),
    ]);

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
  const account = fetchAccount(event.params.account);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    fetchAccount(event.transaction.from).id,
    event.params.role,
    account.id
  );

  log.info('Fund role granted event: role={}, account={}, fund={}', [
    roleGranted.role.toHexString(),
    roleGranted.account.toHexString(),
    event.address.toHexString(),
  ]);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < fund.admins.length; i++) {
      if (fund.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      fund.admins = fund.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < fund.supplyManagers.length; i++) {
      if (fund.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      fund.supplyManagers = fund.supplyManagers.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < fund.userManagers.length; i++) {
      if (fund.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      fund.userManagers = fund.userManagers.concat([account.id]);
    }
  }

  fund.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const fund = fetchFund(event.address);
  const account = fetchAccount(event.params.account);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    fetchAccount(event.transaction.from).id,
    event.params.role,
    account.id
  );

  log.info('Fund role revoked event: role={}, account={}, fund={}', [
    roleRevoked.role.toHexString(),
    roleRevoked.account.toHexString(),
    event.address.toHexString(),
  ]);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < fund.admins.length; i++) {
      if (!fund.admins[i].equals(account.id)) {
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
      if (!fund.supplyManagers[i].equals(account.id)) {
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
      if (!fund.userManagers[i].equals(account.id)) {
        newUserManagers.push(fund.userManagers[i]);
      }
    }
    fund.userManagers = newUserManagers;
  }

  fund.save();
}
