import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  log,
  store,
} from "@graphprotocol/graph-ts";
import { Bond } from "../../generated/schema";
import {
  Approval,
  BondMatured,
  BondRedeemed,
  Clawback,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  Transfer,
  UnderlyingAssetTopUp,
  UnderlyingAssetWithdrawn,
  Unpaused,
  UserBlocked,
  UserUnblocked,
} from "../../generated/templates/Bond/Bond";
import { fetchAccount } from "../fetch/account";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { blockUser, unblockUser } from "../fetch/block-user";
import { toDecimals } from "../utils/decimals";
import { AssetType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";
import { calculateConcentration } from "./calculations/concentration";
import { accountActivityEvent } from "./events/accountactivity";
import { approvalEvent } from "./events/approval";
import { bondMaturedEvent } from "./events/bondmatured";
import { bondRedeemedEvent } from "./events/bondredeemed";
import { burnEvent } from "./events/burn";
import { clawbackEvent } from "./events/clawback";
import { mintEvent } from "./events/mint";
import { pausedEvent } from "./events/paused";
import { roleAdminChangedEvent } from "./events/roleadminchanged";
import { roleGrantedEvent } from "./events/rolegranted";
import { roleRevokedEvent } from "./events/rolerevoked";
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { transferEvent } from "./events/transfer";
import { underlyingAssetTopUpEvent } from "./events/underlyingassettopup";
import { underlyingAssetWithdrawnEvent } from "./events/underlyingassetwithdrawn";
import { unpausedEvent } from "./events/unpaused";
import { userBlockedEvent } from "./events/userblocked";
import { userUnblockedEvent } from "./events/userunblocked";
import { fetchAssetDecimals } from "./fetch/asset";
import { fetchAssetCount } from "./fetch/asset-count";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchBond } from "./fetch/bond";
import { newAssetStatsData } from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

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

    if (!hasBalance(bond.id, to.id, bond.decimals, false)) {
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

    if (!hasBalance(bond.id, to.id, bond.decimals, false)) {
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

export function handleBondMatured(event: BondMatured): void {
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

  bondMaturedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id
  );
  accountActivityEvent(
    sender,
    EventName.BondMatured,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleBondRedeemed(event: BondRedeemed): void {
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
  bond.underlyingBalanceExact = bond.underlyingBalanceExact.minus(
    event.params.underlyingAmount
  );

  const underlyingDecimals = fetchAssetDecimals(Address.fromBytes(bond.underlyingAsset));
  bond.underlyingBalance = toDecimals(
    bond.underlyingBalanceExact,
    underlyingDecimals
  );

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  bondRedeemedEvent(
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
    EventName.BondRedeemed,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    holder,
    EventName.BondRedeemed,
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
    if (hasBalance(bond.id, assetBalance.account, bond.decimals, false)) {
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
    if (hasBalance(bond.id, assetBalance.account, bond.decimals, false)) {
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

export function handleTokensFrozen(event: TokensFrozen): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Bond tokens frozen event: amount={}, user={}, sender={}, bond={}", [
    event.params.amount.toString(),
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  const assetStats = newAssetStatsData(bond.id, AssetType.bond);
  assetStats.frozen = toDecimals(event.params.amount, bond.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.bond);
  assetActivity.frozenEventCount = assetActivity.frozenEventCount + 1;
  assetActivity.save();

  const balance = fetchAssetBalance(bond.id, user.id, bond.decimals, false);
  balance.frozenExact = event.params.amount;
  balance.frozen = toDecimals(event.params.amount, bond.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    user.id,
    event.params.amount,
    bond.decimals
  );

  accountActivityEvent(
    sender,
    EventName.TokensFrozen,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    user,
    EventName.TokensFrozen,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleUserBlocked(event: UserBlocked): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  bond.lastActivity = event.block.timestamp;
  blockUser(bond.id, user.id, event.block.timestamp);
  updateDerivedFields(bond);
  bond.save();

  const balance = fetchAssetBalance(bond.id, user.id, bond.decimals, false);
  balance.blocked = true;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  log.info("Bond user blocked event: user={}, sender={}, bond={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  userBlockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    user.id
  );
  accountActivityEvent(
    sender,
    EventName.UserBlocked,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    user,
    EventName.UserBlocked,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  unblockUser(bond.id, user.id);
  bond.save();

  const balance = fetchAssetBalance(bond.id, user.id, bond.decimals, false);
  balance.blocked = false;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  log.info("Bond user unblocked event: user={}, sender={}, bond={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  userUnblockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    user.id
  );
  accountActivityEvent(
    sender,
    EventName.UserUnblocked,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    user,
    EventName.UserUnblocked,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleUnderlyingAssetTopUp(event: UnderlyingAssetTopUp): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);

  log.info(
    "Bond underlying asset top up event: amount={}, from={}, sender={}, bond={}",
    [
      event.params.amount.toString(),
      from.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  bond.underlyingBalanceExact = bond.underlyingBalanceExact.plus(event.params.amount);

  const underlyingDecimals = fetchAssetDecimals(Address.fromBytes(bond.underlyingAsset));
  bond.underlyingBalance = toDecimals(
    bond.underlyingBalanceExact,
    underlyingDecimals
  );

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  underlyingAssetTopUpEvent(
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
    EventName.UnderlyingAssetTopUp,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    from,
    EventName.UnderlyingAssetTopUp,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawn
): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const to = fetchAccount(event.params.to);

  log.info(
    "Bond underlying asset withdrawn event: amount={}, to={}, sender={}, bond={}",
    [
      event.params.amount.toString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  bond.underlyingBalanceExact = bond.underlyingBalanceExact.minus(event.params.amount);

  const underlyingDecimals = fetchAssetDecimals(Address.fromBytes(bond.underlyingAsset));
  bond.underlyingBalance = toDecimals(
    bond.underlyingBalanceExact,
    underlyingDecimals
  );

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  underlyingAssetWithdrawnEvent(
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
    EventName.UnderlyingAssetWithdrawn,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    to,
    EventName.UnderlyingAssetWithdrawn,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}

function calculateTotalUnderlyingNeeded(bond: Bond): void {
  // Get underlying asset decimals
  const underlyingDecimals = fetchAssetDecimals(Address.fromBytes(bond.underlyingAsset));

  // Calculate exact value in underlying asset's decimals
  bond.totalUnderlyingNeededExact = bond.totalSupplyExact
    .times(bond.faceValue)
    .div(BigInt.fromI32(10).pow(bond.decimals as u8))
    .times(BigInt.fromI32(10).pow(underlyingDecimals as u8));

  // Convert to decimal for display
  bond.totalUnderlyingNeeded = toDecimals(
    bond.totalUnderlyingNeededExact,
    underlyingDecimals
  );
}

export function updateDerivedFields(bond: Bond): void {
  calculateTotalUnderlyingNeeded(bond);
  // Compare using exact values
  bond.hasSufficientUnderlying = bond.underlyingBalanceExact.ge(
    bond.totalUnderlyingNeededExact
  );
  // Calculate concentration
  bond.concentration = calculateConcentration(
    bond.holders.load(),
    bond.totalSupplyExact
  );
}

export function handleClawback(event: Clawback): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);
  const to = fetchAccount(event.params.to);
  const assetActivity = fetchAssetActivity(AssetType.bond);

  const assetStats = newAssetStatsData(bond.id, AssetType.bond);

  // Create clawback event record
  const clawback = clawbackEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    from.id,
    to.id,
    event.params.amount,
    bond.decimals
  );

  log.info(
    "Bond clawback event: amount={}, from={}, to={}, sender={}, bond={}",
    [
      clawback.amount.toString(),
      clawback.from.toHexString(),
      clawback.to.toHexString(),
      clawback.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  if (!hasBalance(bond.id, to.id, bond.decimals, false)) {
    bond.totalHolders = bond.totalHolders + 1;
    to.balancesCount = to.balancesCount + 1;
  }

  to.totalBalanceExact = to.totalBalanceExact.plus(clawback.amountExact);
  to.totalBalance = toDecimals(to.totalBalanceExact, 18);
  to.save();

  from.totalBalanceExact = from.totalBalanceExact.minus(clawback.amountExact);
  from.totalBalance = toDecimals(from.totalBalanceExact, 18);
  from.save();

  const fromBalance = fetchAssetBalance(bond.id, from.id, bond.decimals, false);
  fromBalance.valueExact = fromBalance.valueExact.minus(clawback.amountExact);
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
  toBalance.valueExact = toBalance.valueExact.plus(clawback.amountExact);
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

  // Update asset stats for clawback event
  assetStats.volume = clawback.amount;
  assetStats.volumeExact = clawback.amountExact;
  assetActivity.clawbackEventCount = assetActivity.clawbackEventCount + 1;

  bond.lastActivity = event.block.timestamp;
  updateDerivedFields(bond);
  bond.save();

  assetStats.supply = bond.totalSupply;
  assetStats.supplyExact = bond.totalSupplyExact;
  assetStats.save();

  assetActivity.save();

  // Record account activity events for all involved parties
  accountActivityEvent(
    to,
    EventName.Clawback,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    from,
    EventName.Clawback,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
  accountActivityEvent(
    sender,
    EventName.Clawback,
    event.block.timestamp,
    AssetType.bond,
    bond.id
  );
}
