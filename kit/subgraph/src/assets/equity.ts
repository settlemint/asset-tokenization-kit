import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  log,
  store,
} from "@graphprotocol/graph-ts";
import {
  Approval,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  Transfer,
  Unpaused,
  UserBlocked,
  UserUnblocked,
} from "../../generated/templates/Equity/Equity";
import { fetchAccount } from "../fetch/account";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { toDecimals } from "../utils/decimals";
import { AssetType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";
import { accountActivityEvent } from "./events/accountactivity";
import { approvalEvent } from "./events/approval";
import { burnEvent } from "./events/burn";
import { mintEvent } from "./events/mint";
import { pausedEvent } from "./events/paused";
import { roleAdminChangedEvent } from "./events/roleadminchanged";
import { roleGrantedEvent } from "./events/rolegranted";
import { roleRevokedEvent } from "./events/rolerevoked";
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { transferEvent } from "./events/transfer";
import { unpausedEvent } from "./events/unpaused";
import { userBlockedEvent } from "./events/userblocked";
import { userUnblockedEvent } from "./events/userunblocked";
import { fetchAssetCount } from "./fetch/asset-count";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchEquity } from "./fetch/equity";
import { newAssetStatsData } from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

export function handleTransfer(event: Transfer): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const assetActivity = fetchAssetActivity(AssetType.equity);

  const assetStats = newAssetStatsData(
    equity.id,
    AssetType.equity,
    equity.equityCategory,
    equity.equityClass
  );

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.equity,
      to.id,
      event.params.value,
      equity.decimals
    );

    log.info("Equity mint event: amount={}, to={}, sender={}, equity={}", [
      mint.value.toString(),
      mint.to.toHexString(),
      mint.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // increase total supply
    equity.totalSupplyExact = equity.totalSupplyExact.plus(mint.valueExact);
    equity.totalSupply = toDecimals(equity.totalSupplyExact, equity.decimals);
    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.plus(
      mint.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.plus(mint.value);

    if (!hasBalance(equity.id, to.id)) {
      equity.totalHolders = equity.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(mint.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    const balance = fetchAssetBalance(equity.id, to.id, equity.decimals, false);
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, equity.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    const portfolioStats = newPortfolioStatsData(
      to.id,
      equity.id,
      AssetType.equity
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, equity.decimals);
    assetStats.mintedExact = event.params.value;
    assetActivity.mintEventCount = assetActivity.mintEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Mint,
      event.block.timestamp,
      AssetType.equity,
      equity.id
    );
    accountActivityEvent(
      to,
      EventName.Mint,
      event.block.timestamp,
      AssetType.equity,
      equity.id
    );
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);
    const burn = burnEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.equity,
      from.id,
      event.params.value,
      equity.decimals
    );

    log.info("Equity burn event: amount={}, from={}, sender={}, equity={}", [
      burn.value.toString(),
      burn.from.toHexString(),
      burn.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // decrease total supply
    equity.totalSupplyExact = equity.totalSupplyExact.minus(burn.valueExact);
    equity.totalSupply = toDecimals(equity.totalSupplyExact, equity.decimals);
    equity.totalBurnedExact = equity.totalBurnedExact.plus(burn.valueExact);
    equity.totalBurned = toDecimals(equity.totalBurnedExact, equity.decimals);

    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.minus(
      burn.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.minus(burn.value);

    const balance = fetchAssetBalance(
      equity.id,
      from.id,
      equity.decimals,
      false
    );
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, equity.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    if (balance.valueExact.equals(BigInt.zero())) {
      equity.totalHolders = equity.totalHolders - 1;
      store.remove("AssetBalance", balance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    from.totalBalanceExact = from.totalBalanceExact.minus(burn.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    const portfolioStats = newPortfolioStatsData(
      from.id,
      equity.id,
      AssetType.equity
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, equity.decimals);
    assetStats.burnedExact = event.params.value;
    assetActivity.burnEventCount = assetActivity.burnEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Burn,
      event.block.timestamp,
      AssetType.equity,
      equity.id
    );
    accountActivityEvent(
      from,
      EventName.Burn,
      event.block.timestamp,
      AssetType.equity,
      equity.id
    );
  } else {
    // This will only execute for regular transfers (both addresses non-zero)
    const from = fetchAccount(event.params.from);
    const to = fetchAccount(event.params.to);
    const transfer = transferEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.equity,
      from.id,
      to.id,
      event.params.value,
      equity.decimals
    );

    log.info(
      "Equity transfer event: amount={}, from={}, to={}, sender={}, equity={}",
      [
        transfer.value.toString(),
        transfer.from.toHexString(),
        transfer.to.toHexString(),
        transfer.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    if (!hasBalance(equity.id, to.id)) {
      equity.totalHolders = equity.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(transfer.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(transfer.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    const fromBalance = fetchAssetBalance(
      equity.id,
      from.id,
      equity.decimals,
      false
    );
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, equity.decimals);
    fromBalance.lastActivity = event.block.timestamp;
    fromBalance.save();

    if (fromBalance.valueExact.equals(BigInt.zero())) {
      equity.totalHolders = equity.totalHolders - 1;
      store.remove("AssetBalance", fromBalance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    const fromPortfolioStats = newPortfolioStatsData(
      from.id,
      equity.id,
      AssetType.equity
    );
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(
      equity.id,
      to.id,
      equity.decimals,
      false
    );
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, equity.decimals);
    toBalance.lastActivity = event.block.timestamp;
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(
      to.id,
      equity.id,
      AssetType.equity
    );
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.transfers = assetStats.transfers + 1;
    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
    assetActivity.transferEventCount = assetActivity.transferEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.equity,
      equity.id
    );
    accountActivityEvent(
      from,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.equity,
      equity.id
    );
    accountActivityEvent(
      to,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.equity,
      equity.id
    );
  }

  equity.lastActivity = event.block.timestamp;
  equity.save();

  assetStats.supply = equity.totalSupply;
  assetStats.supplyExact = equity.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const equity = fetchEquity(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    event.params.role,
    account.id
  );

  log.info("Equity role granted event: role={}, account={}, equity={}", [
    roleGranted.role.toHexString(),
    roleGranted.account.toHexString(),
    event.address.toHexString(),
  ]);

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < equity.admins.length; i++) {
      if (equity.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      equity.admins = equity.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < equity.supplyManagers.length; i++) {
      if (equity.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      equity.supplyManagers = equity.supplyManagers.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < equity.userManagers.length; i++) {
      if (equity.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      equity.userManagers = equity.userManagers.concat([account.id]);
    }
  }

  equity.lastActivity = event.block.timestamp;
  equity.save();

  accountActivityEvent(
    sender,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
  accountActivityEvent(
    account,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const equity = fetchEquity(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    event.params.role,
    account.id
  );

  log.info("Equity role revoked event: role={}, account={}, equity={}", [
    roleRevoked.role.toHexString(),
    roleRevoked.account.toHexString(),
    event.address.toHexString(),
  ]);

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < equity.admins.length; i++) {
      if (!equity.admins[i].equals(account.id)) {
        newAdmins.push(equity.admins[i]);
      }
    }
    equity.admins = newAdmins;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < equity.supplyManagers.length; i++) {
      if (!equity.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(equity.supplyManagers[i]);
      }
    }
    equity.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < equity.userManagers.length; i++) {
      if (!equity.userManagers[i].equals(account.id)) {
        newUserManagers.push(equity.userManagers[i]);
      }
    }
    equity.userManagers = newUserManagers;
  }

  equity.lastActivity = event.block.timestamp;
  equity.save();

  accountActivityEvent(
    sender,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
  accountActivityEvent(
    account,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}

export function handleApproval(event: Approval): void {
  const equity = fetchEquity(event.address);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);
  const sender = fetchAccount(event.transaction.from);

  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(
    equity.id,
    owner.id,
    equity.decimals,
    false
  );
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(event.params.value, equity.decimals);
  ownerBalance.lastActivity = event.block.timestamp;
  ownerBalance.save();

  const approval = approvalEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    owner.id,
    spender.id,
    event.params.value,
    equity.decimals
  );

  log.info(
    "Equity approval event: amount={}, owner={}, spender={}, equity={}",
    [
      approval.value.toString(),
      approval.owner.toHexString(),
      approval.spender.toHexString(),
      event.address.toHexString(),
    ]
  );

  equity.lastActivity = event.block.timestamp;
  equity.save();

  accountActivityEvent(
    owner,
    EventName.Approval,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
  accountActivityEvent(
    spender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
  accountActivityEvent(
    sender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);

  const roleAdminChanged = roleAdminChangedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    event.params.role,
    event.params.previousAdminRole,
    event.params.newAdminRole
  );

  log.info(
    "Equity role admin changed event: role={}, previousAdminRole={}, newAdminRole={}, equity={}",
    [
      roleAdminChanged.role.toHexString(),
      roleAdminChanged.previousAdminRole.toHexString(),
      roleAdminChanged.newAdminRole.toHexString(),
      event.address.toHexString(),
    ]
  );

  equity.lastActivity = event.block.timestamp;
  equity.save();

  accountActivityEvent(
    sender,
    EventName.RoleAdminChanged,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}

export function handlePaused(event: Paused): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Equity paused event: sender={}, equity={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  equity.paused = true;
  equity.lastActivity = event.block.timestamp;
  equity.save();

  const assetCount = fetchAssetCount(AssetType.equity);
  assetCount.countPaused = assetCount.countPaused + 1;
  assetCount.save();

  const holders = equity.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(equity.id, assetBalance.account)) {
      const holderAccount =
        sender.id == assetBalance.account
          ? sender
          : fetchAccount(Address.fromBytes(assetBalance.account));
      holderAccount.pausedBalancesCount = holderAccount.pausedBalancesCount + 1;
      holderAccount.pausedBalanceExact = holderAccount.pausedBalanceExact.plus(
        assetBalance.valueExact
      );
      holderAccount.pausedBalance = toDecimals(
        holderAccount.pausedBalanceExact,
        18
      );
      log.info(
        "Updated holder account: id={}, pausedBalancesCount={}, pausedBalance={}",
        [
          holderAccount.id.toHexString(),
          holderAccount.pausedBalancesCount.toString(),
          holderAccount.pausedBalance.toString(),
        ]
      );
      holderAccount.save();
    }
  }

  pausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity
  );
  accountActivityEvent(
    sender,
    EventName.Paused,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}

export function handleUnpaused(event: Unpaused): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Equity unpaused event: sender={}, equity={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  equity.paused = false;
  equity.lastActivity = event.block.timestamp;
  equity.save();

  const assetCount = fetchAssetCount(AssetType.equity);
  assetCount.countPaused = assetCount.countPaused - 1;
  assetCount.save();

  const holders = equity.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(equity.id, assetBalance.account)) {
      const holderAccount =
        sender.id == assetBalance.account
          ? sender
          : fetchAccount(Address.fromBytes(assetBalance.account));
      holderAccount.pausedBalancesCount = holderAccount.pausedBalancesCount - 1;
      holderAccount.pausedBalanceExact = holderAccount.pausedBalanceExact.minus(
        assetBalance.valueExact
      );
      holderAccount.pausedBalance = toDecimals(
        holderAccount.pausedBalanceExact,
        18
      );
      log.info(
        "Updated holder account: id={}, pausedBalancesCount={}, pausedBalance={}",
        [
          holderAccount.id.toHexString(),
          holderAccount.pausedBalancesCount.toString(),
          holderAccount.pausedBalance.toString(),
        ]
      );
      holderAccount.save();
    }
  }

  unpausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity
  );
  accountActivityEvent(
    sender,
    EventName.Unpaused,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info(
    "Equity tokens frozen event: amount={}, user={}, sender={}, equity={}",
    [
      event.params.amount.toString(),
      user.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(equity.id, user.id, equity.decimals, false);
  balance.frozenExact = event.params.amount;
  balance.frozen = toDecimals(event.params.amount, equity.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(
    equity.id,
    AssetType.equity,
    equity.equityCategory,
    equity.equityClass
  );
  assetStats.frozen = toDecimals(event.params.amount, equity.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.equity);
  assetActivity.frozenEventCount = assetActivity.frozenEventCount + 1;
  assetActivity.save();
  equity.lastActivity = event.block.timestamp;
  equity.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    user.id,
    event.params.amount,
    equity.decimals
  );

  accountActivityEvent(
    sender,
    EventName.TokensFrozen,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
  accountActivityEvent(
    user,
    EventName.TokensFrozen,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}

export function handleUserBlocked(event: UserBlocked): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Equity user blocked event: user={}, sender={}, equity={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  equity.lastActivity = event.block.timestamp;
  equity.save();

  const balance = fetchAssetBalance(equity.id, user.id, equity.decimals, false);
  balance.blocked = true;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  userBlockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    user.id
  );
  accountActivityEvent(
    sender,
    EventName.UserBlocked,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
  accountActivityEvent(
    user,
    EventName.UserBlocked,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Equity user unblocked event: user={}, sender={}, equity={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  equity.lastActivity = event.block.timestamp;
  equity.save();

  const balance = fetchAssetBalance(equity.id, user.id, equity.decimals, false);
  balance.blocked = false;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  userUnblockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    user.id
  );
  accountActivityEvent(
    sender,
    EventName.UserUnblocked,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
  accountActivityEvent(
    user,
    EventName.UserUnblocked,
    event.block.timestamp,
    AssetType.equity,
    equity.id
  );
}
