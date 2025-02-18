import { Address, ByteArray, Bytes, crypto, log } from '@graphprotocol/graph-ts';
import {
  Approval,
  ManagementFeeCollected,
  Paused,
  PerformanceFeeCollected,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenWithdrawn,
  TokensFrozen,
  TokensUnfrozen,
  Transfer,
  Unpaused,
  UserBlocked,
  UserUnblocked,
} from '../../generated/templates/Fund/Fund';
import { fetchAccount } from '../fetch/account';
import { fetchAssetBalance, hasBalance } from '../fetch/balance';
import { toDecimals } from '../utils/decimals';
import { AssetType, EventName } from '../utils/enums';
import { eventId } from '../utils/events';
import { accountActivityEvent } from './events/accountactivity';
import { approvalEvent } from './events/approval';
import { burnEvent } from './events/burn';
import { managementFeeCollectedEvent } from './events/managementfeecollected';
import { mintEvent } from './events/mint';
import { pausedEvent } from './events/paused';
import { performanceFeeCollectedEvent } from './events/performancefeecollected';
import { roleAdminChangedEvent } from './events/roleadminchanged';
import { roleGrantedEvent } from './events/rolegranted';
import { roleRevokedEvent } from './events/rolerevoked';
import { tokensFrozenEvent } from './events/tokensfrozen';
import { tokensUnfrozenEvent } from './events/tokensunfrozen';
import { tokenWithdrawnEvent } from './events/tokenwithdrawn';
import { transferEvent } from './events/transfer';
import { unpausedEvent } from './events/unpaused';
import { userBlockedEvent } from './events/userblocked';
import { userUnblockedEvent } from './events/userunblocked';
import { fetchAssetActivity } from './fetch/assets';
import { fetchFund } from './fetch/fund';
import { newAssetStatsData } from './stats/assets';
import { newPortfolioStatsData } from './stats/portfolio';

export function handleTransfer(event: Transfer): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const assetActivity = fetchAssetActivity(AssetType.fund);

  const assetStats = newAssetStatsData(fund.id, AssetType.fund, fund.fundCategory, fund.fundClass);

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender,
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

    if (!hasBalance(fund.id, to.id)) {
      to.assetCount = to.assetCount + 1;
      to.save();
    }

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
    assetActivity.mintEventCount = assetActivity.mintEventCount + 1;

    accountActivityEvent(sender, EventName.Mint, event.block.timestamp, AssetType.fund, fund.id);
    accountActivityEvent(to, EventName.Mint, event.block.timestamp, AssetType.fund, fund.id);
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);
    const burn = burnEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender,
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
    assetActivity.burnEventCount = assetActivity.burnEventCount + 1;

    accountActivityEvent(sender, EventName.Burn, event.block.timestamp, AssetType.fund, fund.id);
    accountActivityEvent(from, EventName.Burn, event.block.timestamp, AssetType.fund, fund.id);
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
      fund.decimals
    );

    log.info('Fund transfer event: amount={}, from={}, to={}, sender={}, fund={}', [
      transfer.value.toString(),
      transfer.from.toHexString(),
      transfer.to.toHexString(),
      transfer.sender.toHexString(),
      event.address.toHexString(),
    ]);

    if (!hasBalance(fund.id, to.id)) {
      to.assetCount = to.assetCount + 1;
      to.save();
    }

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

    assetStats.transfers = assetStats.transfers + 1;
    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
    assetActivity.transferEventCount = assetActivity.transferEventCount + 1;

    accountActivityEvent(sender, EventName.Transfer, event.block.timestamp, AssetType.fund, fund.id);
    accountActivityEvent(from, EventName.Transfer, event.block.timestamp, AssetType.fund, fund.id);
    accountActivityEvent(to, EventName.Transfer, event.block.timestamp, AssetType.fund, fund.id);
  }

  fund.lastActivity = event.block.timestamp;
  fund.save();

  assetStats.supply = fund.totalSupply;
  assetStats.supplyExact = fund.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const fund = fetchFund(event.address);
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

  fund.lastActivity = event.block.timestamp;
  fund.save();

  accountActivityEvent(sender, EventName.RoleGranted, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(account, EventName.RoleGranted, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const fund = fetchFund(event.address);
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

  fund.lastActivity = event.block.timestamp;
  fund.save();

  accountActivityEvent(sender, EventName.RoleRevoked, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(account, EventName.RoleRevoked, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleApproval(event: Approval): void {
  const fund = fetchFund(event.address);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);
  const sender = fetchAccount(event.transaction.from);
  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(fund.id, owner.id, fund.decimals);
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(event.params.value, fund.decimals);
  ownerBalance.save();

  const approval = approvalEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    owner.id,
    spender.id,
    event.params.value,
    fund.decimals
  );

  log.info('Fund approval event: amount={}, owner={}, spender={}, fund={}', [
    approval.value.toString(),
    approval.owner.toHexString(),
    approval.spender.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  fund.save();

  accountActivityEvent(owner, EventName.Approval, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(spender, EventName.Approval, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(sender, EventName.Approval, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const fund = fetchFund(event.address);
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

  log.info('Fund role admin changed event: role={}, previousAdminRole={}, newAdminRole={}, fund={}', [
    roleAdminChanged.role.toHexString(),
    roleAdminChanged.previousAdminRole.toHexString(),
    roleAdminChanged.newAdminRole.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  fund.save();

  accountActivityEvent(sender, EventName.RoleAdminChanged, event.block.timestamp, AssetType.fund, fund.id);
}

export function handlePaused(event: Paused): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info('Fund paused event: sender={}, fund={}', [sender.id.toHexString(), event.address.toHexString()]);

  fund.paused = true;
  fund.lastActivity = event.block.timestamp;
  fund.save();

  pausedEvent(eventId(event), event.block.timestamp, event.address, sender);
  accountActivityEvent(sender, EventName.Paused, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleUnpaused(event: Unpaused): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info('Fund unpaused event: sender={}, fund={}', [sender.id.toHexString(), event.address.toHexString()]);

  fund.paused = false;
  fund.lastActivity = event.block.timestamp;
  fund.save();

  unpausedEvent(eventId(event), event.block.timestamp, event.address, sender);
  accountActivityEvent(sender, EventName.Unpaused, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info('Fund tokens frozen event: amount={}, user={}, sender={}, fund={}', [
    event.params.amount.toString(),
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  const balance = fetchAssetBalance(fund.id, user.id, fund.decimals);
  balance.frozen = event.params.amount;
  balance.save();

  const assetStats = newAssetStatsData(fund.id, AssetType.fund, fund.fundCategory, fund.fundClass);
  assetStats.frozen = toDecimals(event.params.amount, fund.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.fund);
  assetActivity.frozenEventCount = assetActivity.frozenEventCount + 1;
  assetActivity.save();

  fund.lastActivity = event.block.timestamp;
  fund.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    user.id,
    event.params.amount,
    fund.decimals
  );
  accountActivityEvent(sender, EventName.TokensFrozen, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(user, EventName.TokensFrozen, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleTokensUnfrozen(event: TokensUnfrozen): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info('Fund tokens unfrozen event: amount={}, user={}, sender={}, fund={}', [
    event.params.amount.toString(),
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  const balance = fetchAssetBalance(fund.id, user.id, fund.decimals);
  balance.frozen = event.params.amount;
  balance.save();

  const assetStats = newAssetStatsData(fund.id, AssetType.fund, fund.fundCategory, fund.fundClass);
  assetStats.unfrozen = toDecimals(event.params.amount, fund.decimals);
  assetStats.unfrozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.fund);
  assetActivity.unfrozenEventCount = assetActivity.unfrozenEventCount + 1;
  assetActivity.save();

  fund.lastActivity = event.block.timestamp;
  fund.save();

  tokensUnfrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    user.id,
    event.params.amount,
    fund.decimals
  );
  accountActivityEvent(sender, EventName.TokensUnfrozen, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(user, EventName.TokensUnfrozen, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleUserBlocked(event: UserBlocked): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info('Fund user blocked event: user={}, sender={}, fund={}', [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  fund.save();

  const balance = fetchAssetBalance(fund.id, user.id, fund.decimals);
  balance.blocked = true;
  balance.save();

  userBlockedEvent(eventId(event), event.block.timestamp, event.address, sender, user.id);
  accountActivityEvent(sender, EventName.UserBlocked, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(user, EventName.UserBlocked, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info('Fund user unblocked event: user={}, sender={}, fund={}', [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  fund.save();

  const balance = fetchAssetBalance(fund.id, user.id, fund.decimals);
  balance.blocked = false;
  balance.save();

  userUnblockedEvent(eventId(event), event.block.timestamp, event.address, sender, user.id);
  accountActivityEvent(sender, EventName.UserUnblocked, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(user, EventName.UserUnblocked, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleManagementFeeCollected(event: ManagementFeeCollected): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info('Fund management fee collected event: amount={}, timestamp={}, sender={}, fund={}', [
    event.params.amount.toString(),
    event.params.timestamp.toString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  fund.save();

  managementFeeCollectedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    event.params.amount,
    fund.decimals
  );
  accountActivityEvent(sender, EventName.ManagementFeeCollected, event.block.timestamp, AssetType.fund, fund.id);
}

export function handlePerformanceFeeCollected(event: PerformanceFeeCollected): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info('Fund performance fee collected event: amount={}, timestamp={}, sender={}, fund={}', [
    event.params.amount.toString(),
    event.params.timestamp.toString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  fund.save();

  performanceFeeCollectedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    event.params.amount,
    fund.decimals
  );
  accountActivityEvent(sender, EventName.PerformanceFeeCollected, event.block.timestamp, AssetType.fund, fund.id);
}

export function handleTokenWithdrawn(event: TokenWithdrawn): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const token = fetchAccount(event.params.token);
  const to = fetchAccount(event.params.to);

  log.info('Fund token withdrawn event: token={}, to={}, amount={}, sender={}, fund={}', [
    token.id.toHexString(),
    to.id.toHexString(),
    event.params.amount.toString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  fund.save();

  tokenWithdrawnEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender,
    token.id,
    to.id,
    event.params.amount,
    fund.decimals
  );
  accountActivityEvent(sender, EventName.TokenWithdrawn, event.block.timestamp, AssetType.fund, fund.id);
  accountActivityEvent(to, EventName.TokenWithdrawn, event.block.timestamp, AssetType.fund, fund.id);
}
