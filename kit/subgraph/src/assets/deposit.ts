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
  CollateralUpdated,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  TokenWithdrawn,
  Transfer,
  Unpaused,
  UserAllowed,
  UserDisallowed,
} from "../../generated/templates/Deposit/Deposit";
import { fetchAccount } from "../fetch/account";
import { allowUser, disallowUser } from "../fetch/allow-user";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { toDecimals } from "../utils/decimals";
import { AssetType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";
import { depositCollateralCalculatedFields } from "./calculations/collateral";
import { calculateConcentration } from "./calculations/concentration";
import { accountActivityEvent } from "./events/accountactivity";
import { approvalEvent } from "./events/approval";
import { burnEvent } from "./events/burn";
import { collateralUpdatedEvent } from "./events/collateralupdated";
import { mintEvent } from "./events/mint";
import { pausedEvent } from "./events/paused";
import { roleAdminChangedEvent } from "./events/roleadminchanged";
import { roleGrantedEvent } from "./events/rolegranted";
import { roleRevokedEvent } from "./events/rolerevoked";
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { transferEvent } from "./events/transfer";
import { unpausedEvent } from "./events/unpaused";
import { userAllowedEvent } from "./events/userallowed";
import { userDisallowedEvent } from "./events/userdisallowed";
import { fetchAssetCount } from "./fetch/asset-count";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchDeposit } from "./fetch/deposit";
import { newAssetStatsData, updateDepositCollateralData } from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

export function handleTransfer(event: Transfer): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const assetActivity = fetchAssetActivity(AssetType.deposit);

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.deposit,
      to.id,
      event.params.value,
      deposit.decimals
    );

    log.info("Deposit mint event: amount={}, to={}, sender={}, token={}", [
      mint.value.toString(),
      mint.to.toHexString(),
      mint.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // increase total supply
    deposit.totalSupplyExact = deposit.totalSupplyExact.plus(mint.valueExact);
    deposit.totalSupply = toDecimals(
      deposit.totalSupplyExact,
      deposit.decimals
    );
    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.plus(
      mint.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.plus(mint.value);

    // Update collateral calculated fields after supply change
    depositCollateralCalculatedFields(deposit);
    deposit.concentration = calculateConcentration(
      deposit.holders.load(),
      deposit.totalSupplyExact
    );

    if (!hasBalance(deposit.id, to.id, deposit.decimals, false)) {
      deposit.totalHolders = deposit.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(mint.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    const balance = fetchAssetBalance(
      deposit.id,
      to.id,
      deposit.decimals,
      true
    );
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, deposit.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    const portfolioStats = newPortfolioStatsData(
      to.id,
      deposit.id,
      AssetType.deposit
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, deposit.decimals);
    assetStats.mintedExact = event.params.value;
    // Update collateral data in asset stats
    updateDepositCollateralData(assetStats, deposit);

    assetActivity.mintEventCount = assetActivity.mintEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Mint,
      event.block.timestamp,
      AssetType.deposit,
      deposit.id
    );
    accountActivityEvent(
      to,
      EventName.Mint,
      event.block.timestamp,
      AssetType.deposit,
      deposit.id
    );
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);
    const burn = burnEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.deposit,
      from.id,
      event.params.value,
      deposit.decimals
    );

    log.info("Deposit burn event: amount={}, from={}, sender={}, token={}", [
      burn.value.toString(),
      burn.from.toHexString(),
      burn.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // decrease total supply
    deposit.totalSupplyExact = deposit.totalSupplyExact.minus(burn.valueExact);
    deposit.totalSupply = toDecimals(
      deposit.totalSupplyExact,
      deposit.decimals
    );
    deposit.totalBurnedExact = deposit.totalBurnedExact.plus(burn.valueExact);
    deposit.totalBurned = toDecimals(
      deposit.totalBurnedExact,
      deposit.decimals
    );

    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.minus(
      burn.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.minus(burn.value);

    // Update collateral calculated fields after supply change
    depositCollateralCalculatedFields(deposit);
    deposit.concentration = calculateConcentration(
      deposit.holders.load(),
      deposit.totalSupplyExact
    );

    const balance = fetchAssetBalance(
      deposit.id,
      from.id,
      deposit.decimals,
      true
    );
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, deposit.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(burn.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    if (balance.valueExact.equals(BigInt.zero())) {
      deposit.totalHolders = deposit.totalHolders - 1;
      store.remove("AssetBalance", balance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    const portfolioStats = newPortfolioStatsData(
      from.id,
      deposit.id,
      AssetType.deposit
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, deposit.decimals);
    assetStats.burnedExact = event.params.value;
    // Update collateral data in asset stats
    updateDepositCollateralData(assetStats, deposit);

    assetActivity.burnEventCount = assetActivity.burnEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Burn,
      event.block.timestamp,
      AssetType.deposit,
      deposit.id
    );
    accountActivityEvent(
      from,
      EventName.Burn,
      event.block.timestamp,
      AssetType.deposit,
      deposit.id
    );
  } else {
    const from = fetchAccount(event.params.from);
    const to = fetchAccount(event.params.to);
    const transfer = transferEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.deposit,
      from.id,
      to.id,
      event.params.value,
      deposit.decimals
    );

    log.info(
      "Deposit transfer event: amount={}, from={}, to={}, sender={}, token={}",
      [
        transfer.value.toString(),
        transfer.from.toHexString(),
        transfer.to.toHexString(),
        transfer.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    if (!hasBalance(deposit.id, to.id, deposit.decimals, false)) {
      deposit.totalHolders = deposit.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    const fromBalance = fetchAssetBalance(
      deposit.id,
      from.id,
      deposit.decimals,
      true
    );
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, deposit.decimals);
    fromBalance.lastActivity = event.block.timestamp;
    fromBalance.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(transfer.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    if (fromBalance.valueExact.equals(BigInt.zero())) {
      deposit.totalHolders = deposit.totalHolders - 1;
      store.remove("AssetBalance", fromBalance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    const toBalance = fetchAssetBalance(
      deposit.id,
      to.id,
      deposit.decimals,
      true
    );
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, deposit.decimals);
    toBalance.lastActivity = event.block.timestamp;
    toBalance.save();

    to.totalBalanceExact = to.totalBalanceExact.plus(transfer.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    const fromPortfolioStats = newPortfolioStatsData(
      from.id,
      deposit.id,
      AssetType.deposit
    );
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toPortfolioStats = newPortfolioStatsData(
      to.id,
      deposit.id,
      AssetType.deposit
    );
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.transfers = 1;
    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
    // Update collateral data in asset stats
    updateDepositCollateralData(assetStats, deposit);

    assetActivity.transferEventCount = assetActivity.transferEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.deposit,
      deposit.id
    );
    accountActivityEvent(
      from,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.deposit,
      deposit.id
    );
    accountActivityEvent(
      to,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.deposit,
      deposit.id
    );
  }

  deposit.lastActivity = event.block.timestamp;
  deposit.concentration = calculateConcentration(
    deposit.holders.load(),
    deposit.totalSupplyExact
  );
  deposit.save();

  // Update supply in asset stats
  assetStats.supply = deposit.totalSupply;
  assetStats.supplyExact = deposit.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleApproval(event: Approval): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);

  const approval = approvalEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    owner.id,
    spender.id,
    event.params.value,
    deposit.decimals
  );

  log.info(
    "Deposit approval event: amount={}, owner={}, spender={}, sender={}, token={}",
    [
      approval.value.toString(),
      approval.owner.toHexString(),
      approval.spender.toHexString(),
      approval.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(
    deposit.id,
    owner.id,
    deposit.decimals,
    true
  );
  balance.approvedExact = event.params.value;
  balance.approved = toDecimals(balance.approvedExact, deposit.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  accountActivityEvent(
    sender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
  accountActivityEvent(
    owner,
    EventName.Approval,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
  accountActivityEvent(
    spender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handlePaused(event: Paused): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Deposit paused event: sender={}, token={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  deposit.paused = true;
  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  const assetCount = fetchAssetCount(AssetType.deposit);
  assetCount.countPaused = assetCount.countPaused + 1;
  assetCount.save();

  const holders = deposit.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(deposit.id, assetBalance.account, deposit.decimals, true)) {
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

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.save();

  pausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit
  );
  accountActivityEvent(
    sender,
    EventName.Paused,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleUnpaused(event: Unpaused): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Deposit unpaused event: sender={}, token={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  deposit.paused = false;
  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  const assetCount = fetchAssetCount(AssetType.deposit);
  assetCount.countPaused = assetCount.countPaused - 1;
  assetCount.save();

  const holders = deposit.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(deposit.id, assetBalance.account, deposit.decimals, true)) {
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

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.save();

  unpausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit
  );
  accountActivityEvent(
    sender,
    EventName.Unpaused,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info(
    "Deposit tokens frozen event: amount={}, user={}, sender={}, token={}",
    [
      event.params.amount.toString(),
      user.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(
    deposit.id,
    user.id,
    deposit.decimals,
    true
  );
  balance.frozenExact = event.params.amount;
  balance.frozen = toDecimals(balance.frozenExact, deposit.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);
  assetStats.frozen = toDecimals(event.params.amount, deposit.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.frozenEventCount = assetActivity.frozenEventCount + 1;
  assetActivity.save();

  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    user.id,
    event.params.amount,
    deposit.decimals
  );
  accountActivityEvent(
    sender,
    EventName.TokensFrozen,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
  accountActivityEvent(
    user,
    EventName.TokensFrozen,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleUserAllowed(event: UserAllowed): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Deposit user allowed event: user={}, sender={}, token={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  deposit.lastActivity = event.block.timestamp;
  allowUser(deposit.id, user.id, event.block.timestamp);
  deposit.save();

  const balance = fetchAssetBalance(
    deposit.id,
    user.id,
    deposit.decimals,
    true
  );
  balance.blocked = false;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.save();

  userAllowedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    user.id
  );
  accountActivityEvent(
    sender,
    EventName.UserAllowed,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
  accountActivityEvent(
    user,
    EventName.UserAllowed,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleUserDisallowed(event: UserDisallowed): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Deposit user disallowed event: user={}, sender={}, token={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  deposit.lastActivity = event.block.timestamp;
  disallowUser(deposit.id, user.id);
  deposit.save();

  const balance = fetchAssetBalance(
    deposit.id,
    user.id,
    deposit.decimals,
    true
  );
  balance.blocked = true;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.save();

  userDisallowedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    user.id
  );
  accountActivityEvent(
    sender,
    EventName.UserDisallowed,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
  accountActivityEvent(
    user,
    EventName.UserDisallowed,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleTokenWithdrawn(event: TokenWithdrawn): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const token = fetchAccount(event.params.token);
  const to = fetchAccount(event.params.to);

  log.info(
    "Deposit token withdrawn event: amount={}, token={}, to={}, sender={}, deposit={}",
    [
      event.params.amount.toString(),
      token.id.toHexString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  accountActivityEvent(
    sender,
    EventName.TokenWithdrawn,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
  accountActivityEvent(
    to,
    EventName.TokenWithdrawn,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleRoleGranted(event: RoleGranted): void {
  const deposit = fetchDeposit(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    event.params.role,
    account.id
  );

  log.info("Deposit role granted event: role={}, account={}, deposit={}", [
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
    for (let i = 0; i < deposit.admins.length; i++) {
      if (deposit.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      deposit.admins = deposit.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < deposit.supplyManagers.length; i++) {
      if (deposit.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      deposit.supplyManagers = deposit.supplyManagers.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < deposit.userManagers.length; i++) {
      if (deposit.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      deposit.userManagers = deposit.userManagers.concat([account.id]);
    }
  }

  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  accountActivityEvent(
    sender,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
  accountActivityEvent(
    account,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const deposit = fetchDeposit(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    event.params.role,
    account.id
  );

  log.info("Deposit role revoked event: role={}, account={}, deposit={}", [
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
    for (let i = 0; i < deposit.admins.length; i++) {
      if (!deposit.admins[i].equals(account.id)) {
        newAdmins.push(deposit.admins[i]);
      }
    }
    deposit.admins = newAdmins;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < deposit.supplyManagers.length; i++) {
      if (!deposit.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(deposit.supplyManagers[i]);
      }
    }
    deposit.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < deposit.userManagers.length; i++) {
      if (!deposit.userManagers[i].equals(account.id)) {
        newUserManagers.push(deposit.userManagers[i]);
      }
    }
    deposit.userManagers = newUserManagers;
  }

  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  accountActivityEvent(
    sender,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
  accountActivityEvent(
    account,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  const roleAdminChanged = roleAdminChangedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    event.params.role,
    event.params.previousAdminRole,
    event.params.newAdminRole
  );

  log.info(
    "Deposit role admin changed event: role={}, previousAdminRole={}, newAdminRole={}, deposit={}",
    [
      roleAdminChanged.role.toHexString(),
      roleAdminChanged.previousAdminRole.toHexString(),
      roleAdminChanged.newAdminRole.toHexString(),
      event.address.toHexString(),
    ]
  );

  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  accountActivityEvent(
    sender,
    EventName.RoleAdminChanged,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}

export function handleCollateralUpdated(event: CollateralUpdated): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info(
    "Deposit collateral updated event: oldAmount={}, newAmount={}, sender={}, deposit={}",
    [
      event.params.oldAmount.toString(),
      event.params.newAmount.toString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  deposit.collateral = toDecimals(event.params.newAmount, deposit.decimals);
  deposit.collateralExact = event.params.newAmount;
  deposit.lastActivity = event.block.timestamp;
  deposit.lastCollateralUpdate = event.block.timestamp;
  depositCollateralCalculatedFields(deposit);
  deposit.concentration = calculateConcentration(
    deposit.holders.load(),
    deposit.totalSupplyExact
  );
  deposit.save();

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);
  updateDepositCollateralData(assetStats, deposit);
  assetStats.save();

  collateralUpdatedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    event.params.oldAmount,
    event.params.newAmount,
    deposit.decimals
  );
  accountActivityEvent(
    sender,
    EventName.CollateralUpdated,
    event.block.timestamp,
    AssetType.deposit,
    deposit.id
  );
}
