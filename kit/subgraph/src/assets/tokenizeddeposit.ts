import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import {
  Approval,
  Paused,
  TokensFrozen,
  Transfer,
  Unpaused,
  UserAllowed,
  UserDisallowed,
} from "../../generated/templates/TokenizedDeposit/TokenizedDeposit";
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
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { transferEvent } from "./events/transfer";
import { unpausedEvent } from "./events/unpaused";
import { userAllowedEvent } from "./events/userallowed";
import { userDisallowedEvent } from "./events/userdisallowed";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchTokenizedDeposit } from "./fetch/tokenizeddeposit";
import { newAssetStatsData } from "./stats/assets";
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
      true
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

    const balance = fetchAssetBalance(
      tokenizedDeposit.id,
      from.id,
      tokenizedDeposit.decimals,
      true
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
      true
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
      true
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
    true
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
    true
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
    true
  );
  balance.blocked = false;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(
    tokenizedDeposit.id,
    AssetType.tokenizeddeposit
  );
  assetStats.save();

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
    true
  );
  balance.blocked = true;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(
    tokenizedDeposit.id,
    AssetType.tokenizeddeposit
  );
  assetStats.save();

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

// Include other necessary handlers (Transfer, Approval, etc.) similar to cryptocurrency.ts
// but I'll focus on implementing the access control handlers first.
// Let me know if you want me to implement the other handlers as well.
