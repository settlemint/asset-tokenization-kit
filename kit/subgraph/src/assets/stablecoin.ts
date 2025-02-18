import { Address, BigDecimal, ByteArray, Bytes, crypto, log } from '@graphprotocol/graph-ts';
import {
  Approval,
  CollateralUpdated,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  TokensUnfrozen,
  Transfer,
  Unpaused,
  UserBlocked,
  UserUnblocked,
} from '../../generated/templates/StableCoin/StableCoin';
import { fetchAccount } from '../fetch/account';
import { fetchAssetBalance, hasBalance } from '../fetch/balance';
import { toDecimals } from '../utils/decimals';
import { AssetType, EventName } from '../utils/enums';
import { eventId } from '../utils/events';
import { accountActivityEvent } from './events/accountactivity';
import { approvalEvent } from './events/approval';
import { burnEvent } from './events/burn';
import { mintEvent } from './events/mint';
import { pausedEvent } from './events/paused';
import { roleAdminChangedEvent } from './events/roleadminchanged';
import { roleGrantedEvent } from './events/rolegranted';
import { roleRevokedEvent } from './events/rolerevoked';
import { stablecoinCollateralUpdatedEvent } from './events/stablecoincollateralupdated';
import { tokensFrozenEvent } from './events/tokensfrozen';
import { tokensUnfrozenEvent } from './events/tokensunfrozen';
import { transferEvent } from './events/transfer';
import { unpausedEvent } from './events/unpaused';
import { userBlockedEvent } from './events/userblocked';
import { userUnblockedEvent } from './events/userunblocked';
import { fetchAssetActivity } from './fetch/assets';
import { fetchStableCoin } from './fetch/stablecoin';
import { newAssetStatsData } from './stats/assets';
import { newPortfolioStatsData } from './stats/portfolio';

export function handleTransfer(event: Transfer): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);
  const assetActivity = fetchAssetActivity(AssetType.stablecoin);

  const assetStats = newAssetStatsData(stableCoin.id, AssetType.stablecoin);

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender,
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

    if (!hasBalance(stableCoin.id, to.id)) {
      to.assetCount = to.assetCount + 1;
      to.save();
    }

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
    assetStats.collateralRatio = stableCoin.totalSupply.equals(BigDecimal.zero())
    ? BigDecimal.zero()
    : stableCoin.collateral.div(stableCoin.totalSupply);

    assetActivity.mintEventCount = assetActivity.mintEventCount + 1;
    accountActivityEvent(sender, EventName.Mint, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
    accountActivityEvent(to, EventName.Mint, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);
    const burn = burnEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender,
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
    assetStats.collateralRatio = stableCoin.totalSupply.equals(BigDecimal.zero())
    ? BigDecimal.zero()
    : stableCoin.collateral.div(stableCoin.totalSupply);

    assetActivity.burnEventCount = assetActivity.burnEventCount + 1;
    accountActivityEvent(sender, EventName.Burn, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
    accountActivityEvent(from, EventName.Burn, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  } else {
    // This will only execute for regular transfers (both addresses non-zero)
    const from = fetchAccount(event.params.from);
    const to = fetchAccount(event.params.to);
    const transfer = transferEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender,
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

    if (!hasBalance(stableCoin.id, to.id)) {
      to.assetCount = to.assetCount + 1;
      to.save();
    }

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

    assetStats.transfers = assetStats.transfers + 1;
    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;

    assetActivity.transferEventCount = assetActivity.transferEventCount + 1;
    accountActivityEvent(sender, EventName.Transfer, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
    accountActivityEvent(from, EventName.Transfer, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
    accountActivityEvent(to, EventName.Transfer, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  }

  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  assetStats.supply = stableCoin.totalSupply;
  assetStats.supplyExact = stableCoin.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const stableCoin = fetchStableCoin(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
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

  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  accountActivityEvent(sender, EventName.RoleGranted, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  accountActivityEvent(account, EventName.RoleGranted, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const stableCoin = fetchStableCoin(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
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

  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  accountActivityEvent(sender, EventName.RoleRevoked, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  accountActivityEvent(account, EventName.RoleRevoked, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleApproval(event: Approval): void {
  const stableCoin = fetchStableCoin(event.address);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);
  const sender = fetchAccount(event.transaction.from);

  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(stableCoin.id, owner.id, stableCoin.decimals);
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(event.params.value, stableCoin.decimals);
  ownerBalance.save();

  const approval = approvalEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    owner.id,
    spender.id,
    event.params.value,
    stableCoin.decimals
  );

  log.info('StableCoin approval event: amount={}, owner={}, spender={}, stablecoin={}', [
    approval.value.toString(),
    approval.owner.toHexString(),
    approval.spender.toHexString(),
    event.address.toHexString(),
  ]);

  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  accountActivityEvent(sender, EventName.Approval, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  accountActivityEvent(owner, EventName.Approval, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  accountActivityEvent(spender, EventName.Approval, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);
  const roleAdminChanged = roleAdminChangedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    event.params.role,
    event.params.previousAdminRole,
    event.params.newAdminRole
  );

  log.info('StableCoin role admin changed event: role={}, previousAdminRole={}, newAdminRole={}, stablecoin={}', [
    roleAdminChanged.role.toHexString(),
    roleAdminChanged.previousAdminRole.toHexString(),
    roleAdminChanged.newAdminRole.toHexString(),
    event.address.toHexString(),
  ]);

  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  accountActivityEvent(sender, EventName.RoleAdminChanged, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handlePaused(event: Paused): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info('StableCoin paused event: sender={}, stablecoin={}', [sender.id.toHexString(), event.address.toHexString()]);

  stableCoin.paused = true;
  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  pausedEvent(eventId(event), event.block.timestamp, event.address, sender);
  accountActivityEvent(sender, EventName.Paused, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleUnpaused(event: Unpaused): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info('StableCoin unpaused event: sender={}, stablecoin={}', [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  stableCoin.paused = false;
  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  unpausedEvent(eventId(event), event.block.timestamp, event.address, sender);
  accountActivityEvent(sender, EventName.Unpaused, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info('StableCoin tokens frozen event: amount={}, user={}, sender={}, stablecoin={}', [
    event.params.amount.toString(),
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  const balance = fetchAssetBalance(stableCoin.id, user.id, stableCoin.decimals);
  balance.frozen = event.params.amount;
  balance.save();

  const assetStats = newAssetStatsData(stableCoin.id, AssetType.stablecoin);
  assetStats.frozen = toDecimals(event.params.amount, stableCoin.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.stablecoin);
  assetActivity.frozenEventCount = assetActivity.frozenEventCount + 1;
  assetActivity.save();
  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    user.id,
    event.params.amount,
    stableCoin.decimals
  );
  accountActivityEvent(sender, EventName.TokensFrozen, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  accountActivityEvent(user, EventName.TokensFrozen, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleTokensUnfrozen(event: TokensUnfrozen): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info('StableCoin tokens unfrozen event: amount={}, user={}, sender={}, stablecoin={}', [
    event.params.amount.toString(),
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  const balance = fetchAssetBalance(stableCoin.id, user.id, stableCoin.decimals);
  balance.frozen = event.params.amount;
  balance.save();

  const assetStats = newAssetStatsData(stableCoin.id, AssetType.stablecoin);
  assetStats.unfrozen = toDecimals(event.params.amount, stableCoin.decimals);
  assetStats.unfrozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.stablecoin);
  assetActivity.unfrozenEventCount = assetActivity.unfrozenEventCount + 1;
  assetActivity.save();
  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  tokensUnfrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    user.id,
    event.params.amount,
    stableCoin.decimals
  );
  accountActivityEvent(sender, EventName.TokensUnfrozen, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  accountActivityEvent(user, EventName.TokensUnfrozen, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleUserBlocked(event: UserBlocked): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info('StableCoin user blocked event: user={}, sender={}, stablecoin={}', [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  const balance = fetchAssetBalance(stableCoin.id, user.id, stableCoin.decimals);
  balance.blocked = true;
  balance.save();

  userBlockedEvent(eventId(event), event.block.timestamp, event.address, sender, user.id);
  accountActivityEvent(sender, EventName.UserBlocked, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  accountActivityEvent(user, EventName.UserBlocked, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info('StableCoin user unblocked event: user={}, sender={}, stablecoin={}', [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.save();

  const balance = fetchAssetBalance(stableCoin.id, user.id, stableCoin.decimals);
  balance.blocked = false;
  balance.save();

  userUnblockedEvent(eventId(event), event.block.timestamp, event.address, sender, user.id);
  accountActivityEvent(sender, EventName.UserUnblocked, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
  accountActivityEvent(user, EventName.UserUnblocked, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}

export function handleCollateralUpdated(event: CollateralUpdated): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info('StableCoin collateral updated event: oldAmount={}, newAmount={}, sender={}, stablecoin={}', [
    event.params.oldAmount.toString(),
    event.params.newAmount.toString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  stableCoin.collateral = toDecimals(event.params.newAmount, stableCoin.decimals);
  stableCoin.collateralExact = event.params.newAmount;
  stableCoin.lastActivity = event.block.timestamp;
  stableCoin.lastCollateralUpdate = event.block.timestamp;
  stableCoin.save();

  const assetStats = newAssetStatsData(stableCoin.id, AssetType.stablecoin);
  assetStats.collateral = stableCoin.collateral;
  assetStats.collateralExact = stableCoin.collateralExact;
  assetStats.collateralRatio = stableCoin.totalSupply.equals(BigDecimal.zero())
    ? BigDecimal.zero()
    : stableCoin.collateral.div(stableCoin.totalSupply);
  assetStats.save();

  stablecoinCollateralUpdatedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    event.params.oldAmount,
    event.params.newAmount,
    stableCoin.decimals
  );
  accountActivityEvent(sender, EventName.CollateralUpdated, event.block.timestamp, AssetType.stablecoin, stableCoin.id);
}
