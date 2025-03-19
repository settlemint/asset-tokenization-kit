import { Address, BigDecimal, BigInt, ByteArray, Bytes, crypto, log, store } from "@graphprotocol/graph-ts";
import {
  Transfer,
  RoleGranted,
  RoleRevoked,
  Paused,
  Unpaused,
  Matured,
  Redeemed,
  UnderlyingAdded,
  UnderlyingRemoved,
} from "../../generated/templates/Bond/Bond";
import { fetchAccount } from "../fetch/account";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { fetchBond } from "./fetch/bond";
import { fetchAssetActivity } from "../fetch/asset-activity";
import { toDecimals } from "../utils/decimals";
import { AssetType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";
import {
  accountActivityEvent,
  burnEvent,
  mintEvent,
  pauseEvent,
  redeemEvent,
  roleGrantedEvent,
  roleRevokedEvent,
  transferEvent,
  unpauseEvent,
  underlyingAddedEvent,
  underlyingRemovedEvent,
  maturedEvent,
} from "../utils/events";
import { newAssetStatsData, newPortfolioStatsData } from "../utils/stats";
import { updateTotalHolders } from "../utils/update-holders";

export function handleTransfer(event: Transfer): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const assetActivity = fetchAssetActivity(AssetType.bond);

  const assetStats = newAssetStatsData(bond.id, AssetType.bond);

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.bond,
      to.id,
      event.params.value,
      bond.decimals
    );

    log.info("Bond mint event: amount={}, to={}, sender={}, bond={}", [
      mint.value.toString(),
      mint.to.toHexString(),
      mint.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // increase total supply
    bond.totalSupplyExact = bond.totalSupplyExact.plus(mint.valueExact);
    bond.totalSupply = toDecimals(bond.totalSupplyExact, bond.decimals);
    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.plus(
      mint.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.plus(mint.value);

    if (!hasBalance(bond.id, to.id)) {
      bond.totalHolders = bond.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(mint.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    const balance = fetchAssetBalance(bond.id, to.id, bond.decimals, false);
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, bond.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    const portfolioStats = newPortfolioStatsData(
      to.id,
      bond.id,
      AssetType.bond
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, bond.decimals);
    assetStats.mintedExact = event.params.value;
    assetActivity.mintEventCount = assetActivity.mintEventCount + 1;

    accountActivityEvent(
      to,
      EventName.Mint,
      event.block.timestamp,
      AssetType.bond,
      bond.id
    );
    accountActivityEvent(
      sender,
      EventName.Mint,
      event.block.timestamp,
      AssetType.bond,
      bond.id
    );
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);
    const burn = burnEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.bond,
      from.id,
      event.params.value,
      bond.decimals
    );

    log.info("Bond burn event: amount={}, from={}, sender={}, bond={}", [
      burn.value.toString(),
      burn.from.toHexString(),
      burn.sender.toHexString(),
      event.address.toHexString(),
    ]);

    // decrease total supply
    bond.totalSupplyExact = bond.totalSupplyExact.minus(burn.valueExact);
    bond.totalSupply = toDecimals(bond.totalSupplyExact, bond.decimals);
    bond.totalBurnedExact = bond.totalBurnedExact.plus(burn.valueExact);
    bond.totalBurned = toDecimals(bond.totalBurnedExact, bond.decimals);

    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.minus(
      burn.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.minus(burn.value);

    const balance = fetchAssetBalance(bond.id, from.id, bond.decimals, false);
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, bond.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(burn.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    if (balance.valueExact.equals(BigInt.zero())) {
      bond.totalHolders = bond.totalHolders - 1;
      store.remove("AssetBalance", balance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    const portfolioStats = newPortfolioStatsData(
      from.id,
      bond.id,
      AssetType.bond
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, bond.decimals);
    assetStats.burnedExact = event.params.value;
    assetActivity.burnEventCount = assetActivity.burnEventCount + 1;

    accountActivityEvent(
      from,
      EventName.Burn,
      event.block.timestamp,
      AssetType.bond,
      bond.id
    );
    accountActivityEvent(
      sender,
      EventName.Burn,
      event.block.timestamp,
      AssetType.bond,
      bond.id
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
      AssetType.bond,
      from.id,
      to.id,
      event.params.value,
      bond.decimals
    );

    log.info(
      "Bond transfer event: amount={}, from={}, to={}, sender={}, bond={}",
      [
        transfer.value.toString(),
        transfer.from.toHexString(),
        transfer.to.toHexString(),
        transfer.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    if (!hasBalance(bond.id, to.id)) {
      bond.totalHolders = bond.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(transfer.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(transfer.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    const fromBalance = fetchAssetBalance(
      bond.id,
      from.id,
      bond.decimals,
      false
    );
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, bond.decimals);
    fromBalance.lastActivity = event.block.timestamp;
    fromBalance.save();

    if (fromBalance.valueExact.equals(BigInt.zero())) {
      bond.totalHolders = bond.totalHolders - 1;
      store.remove("AssetBalance", fromBalance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    const fromPortfolioStats = newPortfolioStatsData(
      from.id,
      bond.id,
      AssetType.bond
    );
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(bond.id, to.id, bond.decimals, false);
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, bond.decimals);
    toBalance.lastActivity = event.block.timestamp;
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(
      to.id,
      bond.id,
      AssetType.bond
    );
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.transfers = assetStats.transfers + 1;
    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
    assetActivity.transferEventCount = assetActivity.transferEventCount + 1;

    accountActivityEvent(
      to,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.bond,
      bond.id
    );
    accountActivityEvent(
      from,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.bond,
      bond.id
    );
    accountActivityEvent(
      sender,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.bond,
      bond.id
    );
  }

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  assetStats.supply = bond.totalSupply;
  assetStats.supplyExact = bond.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const bond = fetchBond(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    event.params.role,
    account.id
  );

  log.info("Bond role granted event: role={}, account={}, bond={}", [
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
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
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
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
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

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  accountActivityEvent(
    sender,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    account,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const bond = fetchBond(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    event.params.role,
    account.id
  );

  log.info("Bond role revoked event: role={}, account={}, bond={}", [
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
    for (let i = 0; i < bond.admins.length; i++) {
      if (!bond.admins[i].equals(account.id)) {
        newAdmins.push(bond.admins[i]);
      }
    }
    bond.admins = newAdmins;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
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
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
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

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  accountActivityEvent(
    sender,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    account,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleApproval(event: Approval): void {
  const bond = fetchBond(event.address);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);
  const sender = fetchAccount(event.transaction.from);

  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(
    bond.id,
    owner.id,
    bond.decimals,
    false
  );
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(event.params.value, bond.decimals);
  ownerBalance.lastActivity = event.block.timestamp;
  ownerBalance.save();

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  const approval = approvalEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    owner.id,
    spender.id,
    event.params.value,
    bond.decimals
  );

  log.info("Bond approval event: amount={}, owner={}, spender={}, bond={}", [
    approval.value.toString(),
    approval.owner.toHexString(),
    approval.spender.toHexString(),
    event.address.toHexString(),
  ]);

  accountActivityEvent(
    sender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    owner,
    EventName.Approval,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    spender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  const roleAdminChanged = roleAdminChangedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    event.params.role,
    event.params.previousAdminRole,
    event.params.newAdminRole
  );

  log.info(
    "Bond role admin changed event: role={}, previousAdminRole={}, newAdminRole={}, bond={}",
    [
      roleAdminChanged.role.toHexString(),
      roleAdminChanged.previousAdminRole.toHexString(),
      roleAdminChanged.newAdminRole.toHexString(),
      event.address.toHexString(),
    ]
  );

  accountActivityEvent(
    sender,
    EventName.RoleAdminChanged,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleMatured(event: Matured): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Bond matured event: bond={}, sender={}", [
    event.address.toHexString(),
    sender.id.toHexString(),
  ]);

  bond.isMatured = true;
  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  maturedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id
  );
  accountActivityEvent(
    sender,
    EventName.Matured,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleRedeemed(event: Redeemed): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const holder = fetchAccount(event.params.holder);

  log.info("Bond redeemed event: amount={}, holder={}, sender={}, bond={}", [
    event.params.bondAmount.toString(),
    holder.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  // Update bond's redeemed amount
  bond.redeemedAmount = bond.redeemedAmount.plus(event.params.bondAmount);
  bond.underlyingBalance = bond.underlyingBalance.minus(
    event.params.underlyingAmount
  );
  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  redeemEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    holder.id,
    event.params.bondAmount,
    event.params.underlyingAmount,
    bond.decimals
  );

  accountActivityEvent(
    sender,
    EventName.Redeemed,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    holder,
    EventName.Redeemed,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handlePaused(event: Paused): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Bond paused event: sender={}, bond={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  bond.paused = true;
  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  const assetCount = fetchAssetCount(AssetType.bond);
  assetCount.countPaused = assetCount.countPaused + 1;
  assetCount.save();

  const holders = bond.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(bond.id, assetBalance.account)) {
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

  pauseEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond
  );
  accountActivityEvent(
    sender,
    EventName.Paused,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleUnpaused(event: Unpaused): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Bond unpaused event: sender={}, bond={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  bond.paused = false;
  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  const assetCount = fetchAssetCount(AssetType.bond);
  assetCount.countPaused = assetCount.countPaused - 1;
  assetCount.save();

  const holders = bond.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(bond.id, assetBalance.account)) {
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

  unpauseEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond
  );
  accountActivityEvent(
    sender,
    EventName.Unpaused,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleUnderlyingAdded(event: UnderlyingAdded): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);

  log.info(
    "Bond underlying asset added event: amount={}, from={}, sender={}, bond={}",
    [
      event.params.amount.toString(),
      from.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  bond.underlyingBalance = bond.underlyingBalance.plus(event.params.amount);
  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  underlyingAddedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    from.id,
    event.params.amount,
    bond.decimals
  );
  accountActivityEvent(
    sender,
    EventName.UnderlyingAssetAdded,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    from,
    EventName.UnderlyingAssetAdded,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleUnderlyingRemoved(event: UnderlyingRemoved): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const to = fetchAccount(event.params.to);

  log.info(
    "Bond underlying asset removed event: amount={}, to={}, sender={}, bond={}",
    [
      event.params.amount.toString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  bond.underlyingBalance = bond.underlyingBalance.minus(event.params.amount);
  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  underlyingRemovedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    to.id,
    event.params.amount,
    bond.decimals
  );
  accountActivityEvent(
    sender,
    EventName.UnderlyingAssetRemoved,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    to,
    EventName.UnderlyingAssetRemoved,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

function calculateTotalUnderlyingNeeded(bond: Bond): void {
  // Calculate exact value first
  bond.totalUnderlyingNeededExact = bond.totalSupplyExact
    .times(bond.faceValue)
    .div(BigInt.fromI32(10).pow(bond.decimals as u8));

  // Convert to decimal for display
  bond.totalUnderlyingNeeded = toDecimals(
    bond.totalUnderlyingNeededExact,
    bond.decimals
  );
}

export function updateDerivedFields(bond: Bond): void {
  calculateTotalUnderlyingNeeded(bond);
  // Compare using exact values
  bond.hasSufficientUnderlying = bond.underlyingBalance.ge(
    bond.totalUnderlyingNeededExact
  );
  
  // Update the total holders count
  bond.totalHolders = updateTotalHolders(bond.id, "Bond");
}

export function recalculateTotalHolders(bond: Bond): void {
  bond.totalHolders = updateTotalHolders(bond.id, "Bond");
  bond.save();
}