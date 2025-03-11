import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  log,
} from "@graphprotocol/graph-ts";
import {
  Approval,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer,
} from "../../generated/templates/CryptoCurrency/CryptoCurrency";
import { fetchAccount } from "../fetch/account";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { toDecimals } from "../utils/decimals";
import { AssetType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";
import { accountActivityEvent } from "./events/accountactivity";
import { approvalEvent } from "./events/approval";
import { burnEvent } from "./events/burn";
import { mintEvent } from "./events/mint";
import { roleAdminChangedEvent } from "./events/roleadminchanged";
import { roleGrantedEvent } from "./events/rolegranted";
import { roleRevokedEvent } from "./events/rolerevoked";
import { transferEvent } from "./events/transfer";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchCryptoCurrency } from "./fetch/cryptocurrency";
import { newAssetStatsData } from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

export function handleTransfer(event: Transfer): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const sender = fetchAccount(event.transaction.from);
  const assetActivity = fetchAssetActivity(AssetType.cryptocurrency);

  const assetStats = newAssetStatsData(
    cryptoCurrency.id,
    AssetType.cryptocurrency
  );

  if (event.params.from.equals(Address.zero())) {
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

    log.info(
      "CryptoCurrency mint event: amount={}, to={}, sender={}, cryptocurrency={}",
      [
        mint.value.toString(),
        mint.to.toHexString(),
        mint.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    // increase total supply
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.plus(
      mint.valueExact
    );
    cryptoCurrency.totalSupply = toDecimals(
      cryptoCurrency.totalSupplyExact,
      cryptoCurrency.decimals
    );
    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.plus(
      mint.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.plus(mint.value);

    if (!hasBalance(cryptoCurrency.id, to.id)) {
      cryptoCurrency.totalHolders = cryptoCurrency.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
      to.activeBalancesCount = to.activeBalancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(mint.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    const balance = fetchAssetBalance(
      cryptoCurrency.id,
      to.id,
      cryptoCurrency.decimals
    );
    balance.valueExact = balance.valueExact.plus(mint.valueExact);
    balance.value = toDecimals(balance.valueExact, cryptoCurrency.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    const portfolioStats = newPortfolioStatsData(
      to.id,
      cryptoCurrency.id,
      AssetType.cryptocurrency
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, cryptoCurrency.decimals);
    assetStats.mintedExact = event.params.value;
    assetActivity.mintEventCount = assetActivity.mintEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Mint,
      event.block.timestamp,
      AssetType.cryptocurrency,
      cryptoCurrency.id
    );
    accountActivityEvent(
      to,
      EventName.Mint,
      event.block.timestamp,
      AssetType.cryptocurrency,
      cryptoCurrency.id
    );
  } else if (event.params.to.equals(Address.zero())) {
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

    log.info(
      "CryptoCurrency burn event: amount={}, from={}, sender={}, cryptocurrency={}",
      [
        burn.value.toString(),
        burn.from.toHexString(),
        burn.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    // decrease total supply
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.minus(
      burn.valueExact
    );
    cryptoCurrency.totalSupply = toDecimals(
      cryptoCurrency.totalSupplyExact,
      cryptoCurrency.decimals
    );
    cryptoCurrency.totalBurnedExact = cryptoCurrency.totalBurnedExact.plus(
      burn.valueExact
    );
    cryptoCurrency.totalBurned = toDecimals(
      cryptoCurrency.totalBurnedExact,
      cryptoCurrency.decimals
    );

    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.minus(
      burn.valueExact
    );
    assetActivity.totalSupply = assetActivity.totalSupply.minus(burn.value);

    const balance = fetchAssetBalance(
      cryptoCurrency.id,
      from.id,
      cryptoCurrency.decimals
    );
    balance.valueExact = balance.valueExact.minus(burn.valueExact);
    balance.value = toDecimals(balance.valueExact, cryptoCurrency.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(burn.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    const portfolioStats = newPortfolioStatsData(
      from.id,
      cryptoCurrency.id,
      AssetType.cryptocurrency
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, cryptoCurrency.decimals);
    assetStats.burnedExact = event.params.value;
    assetActivity.burnEventCount = assetActivity.burnEventCount + 1;

    accountActivityEvent(
      sender,
      EventName.Burn,
      event.block.timestamp,
      AssetType.cryptocurrency,
      cryptoCurrency.id
    );
    accountActivityEvent(
      from,
      EventName.Burn,
      event.block.timestamp,
      AssetType.cryptocurrency,
      cryptoCurrency.id
    );

    if (balance.valueExact.equals(BigInt.zero())) {
      cryptoCurrency.totalHolders = cryptoCurrency.totalHolders - 1;
    }
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
      cryptoCurrency.decimals
    );

    log.info(
      "CryptoCurrency transfer event: amount={}, from={}, to={}, sender={}, cryptocurrency={}",
      [
        transfer.value.toString(),
        transfer.from.toHexString(),
        transfer.to.toHexString(),
        transfer.sender.toHexString(),
        event.address.toHexString(),
      ]
    );

    if (!hasBalance(cryptoCurrency.id, to.id)) {
      cryptoCurrency.totalHolders = cryptoCurrency.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
      to.activeBalancesCount = to.activeBalancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(transfer.valueExact);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(transfer.valueExact);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    const fromBalance = fetchAssetBalance(
      cryptoCurrency.id,
      from.id,
      cryptoCurrency.decimals
    );
    fromBalance.valueExact = fromBalance.valueExact.minus(transfer.valueExact);
    fromBalance.value = toDecimals(
      fromBalance.valueExact,
      cryptoCurrency.decimals
    );
    fromBalance.lastActivity = event.block.timestamp;
    fromBalance.save();

    if (fromBalance.valueExact.equals(BigInt.zero())) {
      cryptoCurrency.totalHolders = cryptoCurrency.totalHolders - 1;
    }

    const fromPortfolioStats = newPortfolioStatsData(
      from.id,
      cryptoCurrency.id,
      AssetType.cryptocurrency
    );
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(
      cryptoCurrency.id,
      to.id,
      cryptoCurrency.decimals
    );
    toBalance.valueExact = toBalance.valueExact.plus(transfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, cryptoCurrency.decimals);
    toBalance.lastActivity = event.block.timestamp;
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(
      to.id,
      cryptoCurrency.id,
      AssetType.cryptocurrency
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
      AssetType.cryptocurrency,
      cryptoCurrency.id
    );
    accountActivityEvent(
      from,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.cryptocurrency,
      cryptoCurrency.id
    );
    accountActivityEvent(
      to,
      EventName.Transfer,
      event.block.timestamp,
      AssetType.cryptocurrency,
      cryptoCurrency.id
    );
  }

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();

  assetStats.supply = cryptoCurrency.totalSupply;
  assetStats.supplyExact = cryptoCurrency.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleGranted = roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    event.params.role,
    account.id
  );

  log.info(
    "CryptoCurrency role granted event: role={}, account={}, cryptocurrency={}",
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
    for (let i = 0; i < cryptoCurrency.admins.length; i++) {
      if (cryptoCurrency.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      cryptoCurrency.admins = cryptoCurrency.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < cryptoCurrency.supplyManagers.length; i++) {
      if (cryptoCurrency.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      cryptoCurrency.supplyManagers = cryptoCurrency.supplyManagers.concat([
        account.id,
      ]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < cryptoCurrency.userManagers.length; i++) {
      if (cryptoCurrency.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      cryptoCurrency.userManagers = cryptoCurrency.userManagers.concat([
        account.id,
      ]);
    }
  }

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();

  accountActivityEvent(
    sender,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.cryptocurrency,
    cryptoCurrency.id
  );
  accountActivityEvent(
    account,
    EventName.RoleGranted,
    event.block.timestamp,
    AssetType.cryptocurrency,
    cryptoCurrency.id
  );
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const account = fetchAccount(event.params.account);
  const sender = fetchAccount(event.transaction.from);

  const roleRevoked = roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    event.params.role,
    account.id
  );

  log.info(
    "CryptoCurrency role revoked event: role={}, account={}, cryptocurrency={}",
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
    for (let i = 0; i < cryptoCurrency.admins.length; i++) {
      if (!cryptoCurrency.admins[i].equals(account.id)) {
        newAdmins.push(cryptoCurrency.admins[i]);
      }
    }
    cryptoCurrency.admins = newAdmins;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < cryptoCurrency.supplyManagers.length; i++) {
      if (!cryptoCurrency.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(cryptoCurrency.supplyManagers[i]);
      }
    }
    cryptoCurrency.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < cryptoCurrency.userManagers.length; i++) {
      if (!cryptoCurrency.userManagers[i].equals(account.id)) {
        newUserManagers.push(cryptoCurrency.userManagers[i]);
      }
    }
    cryptoCurrency.userManagers = newUserManagers;
  }

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();

  accountActivityEvent(
    sender,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.cryptocurrency,
    cryptoCurrency.id
  );
  accountActivityEvent(
    account,
    EventName.RoleRevoked,
    event.block.timestamp,
    AssetType.cryptocurrency,
    cryptoCurrency.id
  );
}

export function handleApproval(event: Approval): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const sender = fetchAccount(event.transaction.from);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);

  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(
    cryptoCurrency.id,
    owner.id,
    cryptoCurrency.decimals
  );
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(
    event.params.value,
    cryptoCurrency.decimals
  );
  ownerBalance.lastActivity = event.block.timestamp;
  ownerBalance.save();

  const approval = approvalEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    owner.id,
    spender.id,
    event.params.value,
    cryptoCurrency.decimals
  );

  log.info(
    "CryptoCurrency approval event: amount={}, owner={}, spender={}, cryptocurrency={}",
    [
      approval.value.toString(),
      approval.owner.toHexString(),
      approval.spender.toHexString(),
      event.address.toHexString(),
    ]
  );

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();

  accountActivityEvent(
    sender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.cryptocurrency,
    cryptoCurrency.id
  );
  accountActivityEvent(
    owner,
    EventName.Approval,
    event.block.timestamp,
    AssetType.cryptocurrency,
    cryptoCurrency.id
  );
  accountActivityEvent(
    spender,
    EventName.Approval,
    event.block.timestamp,
    AssetType.cryptocurrency,
    cryptoCurrency.id
  );
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const sender = fetchAccount(event.transaction.from);

  const roleAdminChanged = roleAdminChangedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    event.params.role,
    event.params.previousAdminRole,
    event.params.newAdminRole
  );

  log.info(
    "CryptoCurrency role admin changed event: role={}, previousAdminRole={}, newAdminRole={}, cryptocurrency={}",
    [
      roleAdminChanged.role.toHexString(),
      roleAdminChanged.previousAdminRole.toHexString(),
      roleAdminChanged.newAdminRole.toHexString(),
      event.address.toHexString(),
    ]
  );

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();

  accountActivityEvent(
    sender,
    EventName.RoleAdminChanged,
    event.block.timestamp,
    AssetType.cryptocurrency,
    cryptoCurrency.id
  );
}
