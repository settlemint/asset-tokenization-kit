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
} from "../../generated/templates/TokenizedDeposit/TokenizedDeposit";
import { fetchAccount } from "../fetch/account";
import { allowUser, disallowUser } from "../fetch/allow-user";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { toDecimals } from "../utils/decimals";
import { AssetType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";
import { tokenizedDepositCollateralCalculatedFields } from "./calculations/collateral";
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
import { fetchAssetActivity } from "./fetch/assets";
import { fetchTokenizedDeposit } from "./fetch/tokenizeddeposit";
import {
  newAssetStatsData,
  updateTokenizedDepositCollateralData,
} from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

export function handleTransfer(event: Transfer): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const assetActivity = fetchAssetActivity(AssetType.tokenizeddeposit);

  const assetStats = newAssetStatsData(
    tokenizedDeposit.id,
    AssetType.tokenizeddeposit
  );

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);
    const mint = mintEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.tokenizeddeposit,
      to.id,
      event.params.value,
      tokenizedDeposit.decimals
    );

    log.info(
      "TokenizedDeposit mint event: amount={}, to={}, sender={}, token={}",
      [
        mint.value.toString(),
        mint.to.toHexString(),
        mint.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    // increase total supply
    tokenizedDeposit.totalSupplyExact = tokenizedDeposit.totalSupplyExact.plus(
      mint.valueExact
    );
    tokenizedDeposit.totalSupply = toDecimals(
      tokenizedDeposit.totalSupplyExact,
      tokenizedDeposit.decimals
    );
    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.plus(
      mint.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.plus(mint.value);

    // Update collateral calculated fields after supply change
    tokenizedDepositCollateralCalculatedFields(tokenizedDeposit);

    if (!hasBalance(tokenizedDeposit.id, to.id)) {
      tokenizedDeposit.totalHolders = tokenizedDeposit.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(mint.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    const balance = fetchAssetBalance(
      tokenizedDeposit.id,
      to.id,
      tokenizedDeposit.decimals,
      false,
      event.block.timestamp
    );
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, tokenizedDeposit.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    const portfolioStats = newPortfolioStatsData(
      to.id,
      tokenizedDeposit.id,
      AssetType.tokenizeddeposit
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(
      event.params.value,
      tokenizedDeposit.decimals
    );
    assetStats.mintedExact = event.params.value;
    // Update collateral data in asset stats
    updateTokenizedDepositCollateralData(assetStats, tokenizedDeposit);

    assetActivity.mintEventCount = assetActivity.mintEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Mint,
      event.block.timestamp,
      AssetType.tokenizeddeposit,
      tokenizedDeposit.id
    );
    accountActivityEvent(
      to,
      EventName.Mint,
      event.block.timestamp,
      AssetType.tokenizeddeposit,
      tokenizedDeposit.id
    );
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);
    const burn = burnEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.tokenizeddeposit,
      from.id,
      event.params.value,
      tokenizedDeposit.decimals
    );

    log.info(
      "TokenizedDeposit burn event: amount={}, from={}, sender={}, token={}",
      [
        burn.value.toString(),
        burn.from.toHexString(),
        burn.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    // decrease total supply
    tokenizedDeposit.totalSupplyExact = tokenizedDeposit.totalSupplyExact.minus(
      burn.valueExact
    );
    tokenizedDeposit.totalSupply = toDecimals(
      tokenizedDeposit.totalSupplyExact,
      tokenizedDeposit.decimals
    );
    tokenizedDeposit.totalBurnedExact = tokenizedDeposit.totalBurnedExact.plus(
      burn.valueExact
    );
    tokenizedDeposit.totalBurned = toDecimals(
      tokenizedDeposit.totalBurnedExact,
      tokenizedDeposit.decimals
    );

    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.minus(
      burn.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.minus(burn.value);

    // Update collateral calculated fields after supply change
    tokenizedDepositCollateralCalculatedFields(tokenizedDeposit);

    const balance = fetchAssetBalance(
      tokenizedDeposit.id,
      from.id,
      tokenizedDeposit.decimals,
      false,
      event.block.timestamp
    );
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, tokenizedDeposit.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(burn.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    if (balance.valueExact.equals(BigInt.zero())) {
      tokenizedDeposit.totalHolders = tokenizedDeposit.totalHolders - 1;
      store.remove("AssetBalance", balance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    const portfolioStats = newPortfolioStatsData(
      from.id,
      tokenizedDeposit.id,
      AssetType.tokenizeddeposit
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(
      event.params.value,
      tokenizedDeposit.decimals
    );
    assetStats.burnedExact = event.params.value;
    // Update collateral data in asset stats
    updateTokenizedDepositCollateralData(assetStats, tokenizedDeposit);

    assetActivity.burnEventCount = assetActivity.burnEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Burn,
      event.block.timestamp,
      AssetType.tokenizeddeposit,
      tokenizedDeposit.id
    );
    accountActivityEvent(
      from,
      EventName.Burn,
      event.block.timestamp,
      AssetType.tokenizeddeposit,
      tokenizedDeposit.id
    );
  } else {
    const from = fetchAccount(event.params.from);
    const to = fetchAccount(event.params.to);
    const transfer = transferEvent(
      eventId(event),
      event.block.timestamp,
      event.address,
      sender.id,
      AssetType.tokenizeddeposit,
      from.id,
      to.id,
      event.params.value,
      tokenizedDeposit.decimals
    );

    log.info(
      "TokenizedDeposit transfer event: amount={}, from={}, to={}, sender={}, token={}",
      [
        transfer.value.toString(),
        transfer.from.toHexString(),
        transfer.to.toHexString(),
        transfer.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    if (!hasBalance(tokenizedDeposit.id, to.id)) {
      tokenizedDeposit.totalHolders = tokenizedDeposit.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    const fromBalance = fetchAssetBalance(
      tokenizedDeposit.id,
      from.id,
      tokenizedDeposit.decimals,
      false,
      event.block.timestamp
    );
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(
      fromBalance.valueExact,
      tokenizedDeposit.decimals
    );
    fromBalance.lastActivity = event.block.timestamp;
    fromBalance.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(transfer.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    if (fromBalance.valueExact.equals(BigInt.zero())) {
      tokenizedDeposit.totalHolders = tokenizedDeposit.totalHolders - 1;
      store.remove("AssetBalance", fromBalance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    const toBalance = fetchAssetBalance(
      tokenizedDeposit.id,
      to.id,
      tokenizedDeposit.decimals,
      false,
      event.block.timestamp
    );
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(
      toBalance.valueExact,
      tokenizedDeposit.decimals
    );
    toBalance.lastActivity = event.block.timestamp;
    toBalance.save();

    to.totalBalanceExact = to.totalBalanceExact.plus(transfer.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    const fromPortfolioStats = newPortfolioStatsData(
      from.id,
      tokenizedDeposit.id,
      AssetType.tokenizeddeposit
    );
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toPortfolioStats = newPortfolioStatsData(
      to.id,
      tokenizedDeposit.id,
      AssetType.tokenizeddeposit
    );
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.transfers = 1;
    assetStats.volume = transfer.value;
    assetStats.volumeExact = transfer.valueExact;
    // Update collateral data in asset stats
    updateTokenizedDepositCollateralData(assetStats, tokenizedDeposit);

    assetActivity.transferEventCount = assetActivity.transferEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.tokenizeddeposit,
      tokenizedDeposit.id
    );
    accountActivityEvent(
      from,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.tokenizeddeposit,
      tokenizedDeposit.id
    );
    accountActivityEvent(
      to,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.tokenizeddeposit,
      tokenizedDeposit.id
    );
  }

  tokenizedDeposit.lastActivity = event.block.timestamp;
  tokenizedDeposit.save();

  // Update supply in asset stats
  assetStats.supply = tokenizedDeposit.totalSupply;
  assetStats.supplyExact = tokenizedDeposit.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleApproval(event: Approval): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);

  const approval = approvalEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit,
    owner.id,
    spender.id,
    event.params.value,
    tokenizedDeposit.decimals
  );

  log.info(
    "TokenizedDeposit approval event: amount={}, owner={}, spender={}, sender={}, token={}",
    [
      approval.value.toString(),
      approval.owner.toHexString(),
      approval.spender.toHexString(),
      approval.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(
    tokenizedDeposit.id,
    owner.id,
    tokenizedDeposit.decimals,
    false,
    event.block.timestamp
  );
  balance.approvedExact = event.params.value;
  balance.approved = toDecimals(
    balance.approvedExact,
    tokenizedDeposit.decimals
  );
  balance.lastActivity = event.block.timestamp;
  balance.save();

  accountActivityEvent(
    sender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
  accountActivityEvent(
    owner,
    EventName.Approval,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
  accountActivityEvent(
    spender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handlePaused(event: Paused): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  const paused = pausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit
  );

  log.info("TokenizedDeposit paused event: sender={}, token={}", [
    paused.sender.toHexString(),
    event.address.toHexString(),
  ]);

  tokenizedDeposit.paused = true;
  tokenizedDeposit.save();

  accountActivityEvent(
    sender,
    EventName.Paused,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleUnpaused(event: Unpaused): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  const unpaused = unpausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit
  );

  log.info("TokenizedDeposit unpaused event: sender={}, token={}", [
    unpaused.sender.toHexString(),
    event.address.toHexString(),
  ]);

  tokenizedDeposit.paused = false;
  tokenizedDeposit.save();

  accountActivityEvent(
    sender,
    EventName.Unpaused,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  const frozen = tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit,
    user.id,
    event.params.amount,
    tokenizedDeposit.decimals
  );

  log.info(
    "TokenizedDeposit tokens frozen event: amount={}, user={}, sender={}, token={}",
    [
      frozen.amount.toString(),
      frozen.user.toHexString(),
      frozen.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(
    tokenizedDeposit.id,
    user.id,
    tokenizedDeposit.decimals,
    false,
    event.block.timestamp
  );
  balance.frozenExact = event.params.amount;
  balance.frozen = toDecimals(balance.frozenExact, tokenizedDeposit.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(
    tokenizedDeposit.id,
    AssetType.tokenizeddeposit
  );
  assetStats.frozen = toDecimals(
    event.params.amount,
    tokenizedDeposit.decimals
  );
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  accountActivityEvent(
    sender,
    EventName.TokensFrozen,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
  accountActivityEvent(
    user,
    EventName.TokensFrozen,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleUserAllowed(event: UserAllowed): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  const allowedEvent = userAllowedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit,
    user.id
  );

  log.info(
    "TokenizedDeposit user allowed event: user={}, sender={}, token={}",
    [
      allowedEvent.user.toHexString(),
      allowedEvent.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(
    tokenizedDeposit.id,
    user.id,
    tokenizedDeposit.decimals,
    false,
    event.block.timestamp
  );
  balance.blocked = false;
  balance.blockedAt = null;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(
    tokenizedDeposit.id,
    AssetType.tokenizeddeposit
  );
  assetStats.save();

  allowUser(tokenizedDeposit.id, user.id, event.block.timestamp);
  accountActivityEvent(
    sender,
    EventName.UserAllowed,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
  accountActivityEvent(
    user,
    EventName.UserAllowed,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleUserDisallowed(event: UserDisallowed): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  const disallowedEvent = userDisallowedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit,
    user.id
  );

  log.info(
    "TokenizedDeposit user disallowed event: user={}, sender={}, token={}",
    [
      disallowedEvent.user.toHexString(),
      disallowedEvent.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(
    tokenizedDeposit.id,
    user.id,
    tokenizedDeposit.decimals,
    false,
    event.block.timestamp
  );
  balance.blocked = true;
  balance.blockedAt = event.block.timestamp;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(
    tokenizedDeposit.id,
    AssetType.tokenizeddeposit
  );
  assetStats.save();

  disallowUser(tokenizedDeposit.id, user.id);
  accountActivityEvent(
    sender,
    EventName.UserDisallowed,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
  accountActivityEvent(
    user,
    EventName.UserDisallowed,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleTokenWithdrawn(event: TokenWithdrawn): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const token = fetchAccount(event.params.token);
  const to = fetchAccount(event.params.to);

  log.info(
    "TokenizedDeposit token withdrawn event: amount={}, token={}, to={}, sender={}, tokenizedDeposit={}",
    [
      event.params.amount.toString(),
      token.id.toHexString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  tokenizedDeposit.lastActivity = event.block.timestamp;
  tokenizedDeposit.save();

  accountActivityEvent(
    sender,
    EventName.TokenWithdrawn,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
  accountActivityEvent(
    to,
    EventName.TokenWithdrawn,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleRoleGranted(event: RoleGranted): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit,
    event.params.role,
    account.id
  );

  log.info(
    "TokenizedDeposit role granted event: role={}, account={}, tokenizeddeposit={}",
    [
      roleGranted.role.toHexString(),
      roleGranted.account.toHexString(),
      event.address.toHexString(),
    ]
  );

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < tokenizedDeposit.admins.length; i++) {
      if (tokenizedDeposit.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      tokenizedDeposit.admins = tokenizedDeposit.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < tokenizedDeposit.supplyManagers.length; i++) {
      if (tokenizedDeposit.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      tokenizedDeposit.supplyManagers = tokenizedDeposit.supplyManagers.concat([
        account.id,
      ]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < tokenizedDeposit.userManagers.length; i++) {
      if (tokenizedDeposit.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      tokenizedDeposit.userManagers = tokenizedDeposit.userManagers.concat([
        account.id,
      ]);
    }
  }

  tokenizedDeposit.lastActivity = event.block.timestamp;
  tokenizedDeposit.save();

  accountActivityEvent(
    sender,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
  accountActivityEvent(
    account,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit,
    event.params.role,
    account.id
  );

  log.info(
    "TokenizedDeposit role revoked event: role={}, account={}, tokenizeddeposit={}",
    [
      roleRevoked.role.toHexString(),
      roleRevoked.account.toHexString(),
      event.address.toHexString(),
    ]
  );

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < tokenizedDeposit.admins.length; i++) {
      if (!tokenizedDeposit.admins[i].equals(account.id)) {
        newAdmins.push(tokenizedDeposit.admins[i]);
      }
    }
    tokenizedDeposit.admins = newAdmins;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < tokenizedDeposit.supplyManagers.length; i++) {
      if (!tokenizedDeposit.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(tokenizedDeposit.supplyManagers[i]);
      }
    }
    tokenizedDeposit.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < tokenizedDeposit.userManagers.length; i++) {
      if (!tokenizedDeposit.userManagers[i].equals(account.id)) {
        newUserManagers.push(tokenizedDeposit.userManagers[i]);
      }
    }
    tokenizedDeposit.userManagers = newUserManagers;
  }

  tokenizedDeposit.lastActivity = event.block.timestamp;
  tokenizedDeposit.save();

  accountActivityEvent(
    sender,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
  accountActivityEvent(
    account,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  const roleAdminChanged = roleAdminChangedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.tokenizeddeposit,
    event.params.role,
    event.params.previousAdminRole,
    event.params.newAdminRole
  );

  log.info(
    "TokenizedDeposit role admin changed event: role={}, previousAdminRole={}, newAdminRole={}, tokenizeddeposit={}",
    [
      roleAdminChanged.role.toHexString(),
      roleAdminChanged.previousAdminRole.toHexString(),
      roleAdminChanged.newAdminRole.toHexString(),
      event.address.toHexString(),
    ]
  );

  tokenizedDeposit.lastActivity = event.block.timestamp;
  tokenizedDeposit.save();

  accountActivityEvent(
    sender,
    EventName.RoleAdminChanged,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

export function handleCollateralUpdated(event: CollateralUpdated): void {
  const tokenizedDeposit = fetchTokenizedDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info(
    "TokenizedDeposit collateral updated event: oldAmount={}, newAmount={}, sender={}, tokenizedDeposit={}",
    [
      event.params.oldAmount.toString(),
      event.params.newAmount.toString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  tokenizedDeposit.collateral = toDecimals(
    event.params.newAmount,
    tokenizedDeposit.decimals
  );
  tokenizedDeposit.collateralExact = event.params.newAmount;
  tokenizedDeposit.lastActivity = event.block.timestamp;
  tokenizedDeposit.lastCollateralUpdate = event.block.timestamp;
  tokenizedDepositCollateralCalculatedFields(tokenizedDeposit);
  tokenizedDeposit.save();

  const assetStats = newAssetStatsData(
    tokenizedDeposit.id,
    AssetType.tokenizeddeposit
  );
  updateTokenizedDepositCollateralData(assetStats, tokenizedDeposit);
  assetStats.save();

  collateralUpdatedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    event.params.oldAmount,
    event.params.newAmount,
    tokenizedDeposit.decimals
  );
  accountActivityEvent(
    sender,
    EventName.CollateralUpdated,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    tokenizedDeposit.id
  );
}

// Include other necessary handlers (Transfer, Approval, etc.) similar to cryptocurrency.ts
// but I'll focus on implementing the access control handlers first.
// Let me know if you want me to implement the other handlers as well.
