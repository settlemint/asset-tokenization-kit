import { Address, ByteArray, Bytes, crypto, log } from '@graphprotocol/graph-ts';
import { RoleGranted, RoleRevoked, Transfer } from '../../generated/templates/StableCoin/StableCoin';
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
import { fetchStableCoin } from './fetch/stablecoin';
import { newAssetStatsData } from './stats/assets';
import { newPortfolioStatsData } from './stats/portfolio';

export function handleTransfer(event: Transfer): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);

  const assetStats = newAssetStatsData(stableCoin.id, AssetType.stablecoin);

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      to.id,
      event.params.value,
      stableCoin.decimals
    );

    log.info('StableCoin mint event: amount={}, to={}, sender={}, stablecoin={}', [
      mint.value.toString(),
      mint.to.toHexString(),
      mint.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // increase total supply
    stableCoin.totalSupplyExact = stableCoin.totalSupplyExact.plus(mint.valueExact);
    stableCoin.totalSupply = toDecimals(stableCoin.totalSupplyExact, stableCoin.decimals);

    const balance = fetchAssetBalance(stableCoin.id, to.id, stableCoin.decimals);
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, stableCoin.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(to.id, stableCoin.id, AssetType.stablecoin);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, stableCoin.decimals);
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
      stableCoin.decimals
    );

    log.info('StableCoin burn event: amount={}, from={}, sender={}, stablecoin={}', [
      burn.value.toString(),
      burn.from.toHexString(),
      burn.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // decrease total supply
    stableCoin.totalSupplyExact = stableCoin.totalSupplyExact.minus(burn.valueExact);
    stableCoin.totalSupply = toDecimals(stableCoin.totalSupplyExact, stableCoin.decimals);

    const balance = fetchAssetBalance(stableCoin.id, from.id, stableCoin.decimals);
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, stableCoin.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(from.id, stableCoin.id, AssetType.stablecoin);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, stableCoin.decimals);
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
      stableCoin.decimals
    );

    log.info('StableCoin transfer event: amount={}, from={}, to={}, sender={}, stablecoin={}', [
      transfer.value.toString(),
      transfer.from.toHexString(),
      transfer.to.toHexString(),
      transfer.sender.toHexString(),
      event.address.toHexString(),
    ]);

    const fromBalance = fetchAssetBalance(stableCoin.id, from.id, stableCoin.decimals);
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, stableCoin.decimals);
    fromBalance.save();

    const fromPortfolioStats = newPortfolioStatsData(from.id, stableCoin.id, AssetType.stablecoin);
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(stableCoin.id, to.id, stableCoin.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, stableCoin.decimals);
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(to.id, stableCoin.id, AssetType.stablecoin);
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
  }

  stableCoin.save();

  assetStats.supply = stableCoin.totalSupply;
  assetStats.supplyExact = stableCoin.totalSupplyExact;
  assetStats.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const stableCoin = fetchStableCoin(event.address);
  const account = fetchAccount(event.params.account);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    fetchAccount(event.transaction.from).id,
    event.params.role,
    account.id
  );

  log.info('StableCoin role granted event: role={}, account={}, stablecoin={}', [
    roleGranted.role.toHexString(),
    roleGranted.account.toHexString(),
    event.address.toHexString(),
  ]);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < stableCoin.admins.length; i++) {
      if (stableCoin.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      stableCoin.admins = stableCoin.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < stableCoin.supplyManagers.length; i++) {
      if (stableCoin.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      stableCoin.supplyManagers = stableCoin.supplyManagers.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < stableCoin.userManagers.length; i++) {
      if (stableCoin.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      stableCoin.userManagers = stableCoin.userManagers.concat([account.id]);
    }
  }

  stableCoin.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const stableCoin = fetchStableCoin(event.address);
  const account = fetchAccount(event.params.account);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    fetchAccount(event.transaction.from).id,
    event.params.role,
    account.id
  );

  log.info('StableCoin role revoked event: role={}, account={}, stablecoin={}', [
    roleRevoked.role.toHexString(),
    roleRevoked.account.toHexString(),
    event.address.toHexString(),
  ]);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < stableCoin.admins.length; i++) {
      if (!stableCoin.admins[i].equals(account.id)) {
        newAdmins.push(stableCoin.admins[i]);
      }
    }
    stableCoin.admins = newAdmins;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < stableCoin.supplyManagers.length; i++) {
      if (!stableCoin.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(stableCoin.supplyManagers[i]);
      }
    }
    stableCoin.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < stableCoin.userManagers.length; i++) {
      if (!stableCoin.userManagers[i].equals(account.id)) {
        newUserManagers.push(stableCoin.userManagers[i]);
      }
    }
    stableCoin.userManagers = newUserManagers;
  }

  stableCoin.save();
}
