import { Address, ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts';
import { RoleGranted, RoleRevoked, Transfer } from '../../generated/templates/CryptoCurrency/CryptoCurrency';
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
import { fetchCryptoCurrency } from './fetch/cryptocurrency';
import { newAssetStatsData } from './stats/assets';
import { newPortfolioStatsData } from './stats/portfolio';

export function handleTransfer(event: Transfer): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const sender = fetchAccount(event.transaction.from);

  const assetStats = newAssetStatsData(cryptoCurrency.id, AssetType.cryptocurrency);

  if (event.params.from === Address.zero()) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      to.id,
      event.params.value,
      cryptoCurrency.decimals
    );

    // increase total supply
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.plus(mint.valueExact);
    cryptoCurrency.totalSupply = toDecimals(cryptoCurrency.totalSupplyExact, cryptoCurrency.decimals);

    const balance = fetchAssetBalance(cryptoCurrency.id, to.id, cryptoCurrency.decimals);
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, cryptoCurrency.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(to.id, cryptoCurrency.id, AssetType.cryptocurrency);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, cryptoCurrency.decimals);
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
      cryptoCurrency.decimals
    );

    // decrease total supply
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.minus(burn.valueExact);
    cryptoCurrency.totalSupply = toDecimals(cryptoCurrency.totalSupplyExact, cryptoCurrency.decimals);

    const balance = fetchAssetBalance(cryptoCurrency.id, from.id, cryptoCurrency.decimals);
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, cryptoCurrency.decimals);
    balance.save();

    const portfolioStats = newPortfolioStatsData(from.id, cryptoCurrency.id, AssetType.cryptocurrency);
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, cryptoCurrency.decimals);
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
      cryptoCurrency.decimals
    );

    const fromBalance = fetchAssetBalance(cryptoCurrency.id, from.id, cryptoCurrency.decimals);
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, cryptoCurrency.decimals);
    fromBalance.save();

    const fromPortfolioStats = newPortfolioStatsData(from.id, cryptoCurrency.id, AssetType.cryptocurrency);
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(cryptoCurrency.id, to.id, cryptoCurrency.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, cryptoCurrency.decimals);
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(to.id, cryptoCurrency.id, AssetType.cryptocurrency);
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
  }

  cryptoCurrency.save();

  assetStats.supply = cryptoCurrency.totalSupply;
  assetStats.supplyExact = cryptoCurrency.totalSupplyExact;
  assetStats.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const sender = fetchAccount(event.transaction.from);
  const account = fetchAccount(event.params.account);

  roleGrantedEvent(eventId(event), event.block.timestamp, event.address, sender.id, event.params.role, account.id);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    if (!cryptoCurrency.admins.includes(account.id)) {
      cryptoCurrency.admins.push(account.id);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    if (!cryptoCurrency.supplyManagers.includes(account.id)) {
      cryptoCurrency.supplyManagers.push(account.id);
    }
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    if (!cryptoCurrency.userManagers.includes(account.id)) {
      cryptoCurrency.userManagers.push(account.id);
    }
  }

  cryptoCurrency.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const sender = fetchAccount(event.transaction.from);
  const account = fetchAccount(event.params.account);

  roleRevokedEvent(eventId(event), event.block.timestamp, event.address, sender.id, event.params.role, account.id);

  // Handle different roles
  if (event.params.role.toHexString() == '0x0000000000000000000000000000000000000000000000000000000000000000') {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < cryptoCurrency.admins.length; i++) {
      if (cryptoCurrency.admins[i] != account.id) {
        newAdmins.push(cryptoCurrency.admins[i]);
      }
    }
    cryptoCurrency.admins = newAdmins;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('SUPPLY_MANAGEMENT_ROLE')).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < cryptoCurrency.supplyManagers.length; i++) {
      if (cryptoCurrency.supplyManagers[i] != account.id) {
        newSupplyManagers.push(cryptoCurrency.supplyManagers[i]);
      }
    }
    cryptoCurrency.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() == crypto.keccak256(ByteArray.fromUTF8('USER_MANAGEMENT_ROLE')).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < cryptoCurrency.userManagers.length; i++) {
      if (cryptoCurrency.userManagers[i] != account.id) {
        newUserManagers.push(cryptoCurrency.userManagers[i]);
      }
    }
    cryptoCurrency.userManagers = newUserManagers;
  }

  cryptoCurrency.save();
}
