import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  store,
} from "@graphprotocol/graph-ts";
import {
  Approval,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer,
} from "../../generated/templates/CryptoCurrency/CryptoCurrency";
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { decrease, increase } from "../utils/counters";
import { toDecimals } from "../utils/decimals";
import { AssetType } from "../utils/enums";
import { calculateConcentration } from "./calculations/concentration";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchCryptoCurrency } from "./fetch/cryptocurrency";
import { handleMint } from "./handlers/mint";
import { newAssetStatsData } from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

export function handleTransfer(event: Transfer): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const assetActivity = fetchAssetActivity(AssetType.cryptocurrency);

  const assetStats = newAssetStatsData(
    cryptoCurrency.id,
    AssetType.cryptocurrency
  );

  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = cryptoCurrency.decimals;

  if (from.equals(Address.zero())) {
    createActivityLogEntry(event, EventType.Mint, [to]);
    handleMint(
      cryptoCurrency,
      cryptoCurrency.id,
      AssetType.bond,
      event.block.timestamp,
      to,
      value,
      decimals,
      false
    );
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);

    createActivityLogEntry(event, EventType.Burn, [event.params.from]);

    // decrease total supply
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.minus(
      event.params.value
    );
    cryptoCurrency.totalSupply = toDecimals(
      cryptoCurrency.totalSupplyExact,
      cryptoCurrency.decimals
    );
    cryptoCurrency.totalBurnedExact = cryptoCurrency.totalBurnedExact.plus(
      event.params.value
    );
    cryptoCurrency.totalBurned = toDecimals(
      cryptoCurrency.totalBurnedExact,
      cryptoCurrency.decimals
    );

    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.minus(
      event.params.value
    );
    assetActivity.totalSupply = toDecimals(
      assetActivity.totalSupplyExact,
      cryptoCurrency.decimals
    );

    const balance = fetchAssetBalance(
      cryptoCurrency.id,
      from.id,
      cryptoCurrency.decimals,
      false
    );
    balance.valueExact = balance.valueExact.minus(event.params.value);
    balance.value = toDecimals(balance.valueExact, cryptoCurrency.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(event.params.value);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    if (balance.valueExact.equals(BigInt.zero())) {
      decrease(cryptoCurrency, "totalHolders");
      store.remove("AssetBalance", balance.id.toHexString());
      decrease(from, "balancesCount");
      from.save();
    }

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
    increase(assetActivity, "burnEventCount");
  } else {
    // This will only execute for regular transfers (both addresses non-zero)
    const from = fetchAccount(event.params.from);
    const to = fetchAccount(event.params.to);

    createActivityLogEntry(event, EventType.Transfer, [
      event.params.from,
      event.params.to,
    ]);

    if (!hasBalance(cryptoCurrency.id, to.id, cryptoCurrency.decimals, false)) {
      increase(cryptoCurrency, "totalHolders");
      increase(to, "balancesCount");
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(event.params.value);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(event.params.value);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    const fromBalance = fetchAssetBalance(
      cryptoCurrency.id,
      from.id,
      cryptoCurrency.decimals,
      false
    );
    fromBalance.valueExact = fromBalance.valueExact.minus(event.params.value);
    fromBalance.value = toDecimals(
      fromBalance.valueExact,
      cryptoCurrency.decimals
    );
    fromBalance.lastActivity = event.block.timestamp;
    fromBalance.save();

    if (fromBalance.valueExact.equals(BigInt.zero())) {
      decrease(cryptoCurrency, "totalHolders");
      store.remove("AssetBalance", fromBalance.id.toHexString());
      decrease(from, "balancesCount");
      from.save();
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
      cryptoCurrency.decimals,
      false
    );
    toBalance.valueExact = toBalance.valueExact.plus(event.params.value);
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
    assetStats.volume = toDecimals(event.params.value, cryptoCurrency.decimals);
    assetStats.volumeExact = event.params.value;
    increase(assetActivity, "transferEventCount");
  }

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.concentration = calculateConcentration(
    cryptoCurrency.holders.load(),
    cryptoCurrency.totalSupplyExact
  );
  cryptoCurrency.save();

  assetStats.supply = cryptoCurrency.totalSupply;
  assetStats.supplyExact = cryptoCurrency.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const account = fetchAccount(event.params.account);

  createActivityLogEntry(event, EventType.RoleGranted, [event.params.account]);

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
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const account = fetchAccount(event.params.account);

  createActivityLogEntry(event, EventType.RoleRevoked, [event.params.account]);

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
    cryptoCurrency.decimals,
    false
  );
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(
    event.params.value,
    cryptoCurrency.decimals
  );
  ownerBalance.lastActivity = event.block.timestamp;
  ownerBalance.save();

  createActivityLogEntry(event, EventType.Approval, [
    event.params.owner,
    event.params.spender,
  ]);

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);

  createActivityLogEntry(event, EventType.RoleAdminChanged, []);

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();
}
