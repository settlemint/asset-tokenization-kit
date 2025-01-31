import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { Account, Bond, CryptoCurrency, Equity, Event_Transfer, StableCoin } from '../../generated/schema';
import { Transfer as TransferEvent } from '../../generated/templates/StableCoin/StableCoin';
import { fetchAccount } from '../fetch/account';
import { fetchBalance } from '../fetch/balance';
import { fetchStableCoin } from '../fetch/stable-coin';
import { balanceId } from './balance';
import { toDecimals } from './decimals';
import { eventId } from './events';
import {
  recordAccountActivityData,
  recordAssetActivityData,
  recordAssetSupplyData,
  recordTransferData,
} from './timeseries';

type Asset = StableCoin | CryptoCurrency | Bond | Equity;

export function handleAssetTransfer(
  event: TransferEvent,
  assetType: string,
  fetchAsset: (address: Address) => Asset,
  recordAssetMetricsData?: (asset: Asset, blockTimestamp: BigInt) => void
): void {
  log.info('Transfer event received: {} {} {} {}', [
    event.address.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);

  let asset = fetchAsset(event.address);
  let from: Account | null = null;
  let to: Account | null = null;

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = asset.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = asset.id;
  eventTransfer.from = event.params.from;
  eventTransfer.to = event.params.to;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact, asset.decimals);

  let mintedAmount = BigInt.zero();
  let burnedAmount = BigInt.zero();
  let transferredAmount = eventTransfer.valueExact;

  if (event.params.from.equals(Address.zero())) {
    asset.totalSupplyExact = asset.totalSupplyExact.plus(eventTransfer.valueExact);
    asset.totalSupply = toDecimals(asset.totalSupplyExact, asset.decimals);

    mintedAmount = eventTransfer.valueExact;
    transferredAmount = BigInt.zero();
  } else {
    from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(asset.id, from), asset.id, from.id, asset.decimals);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, asset.decimals);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;

    // Record account activity for sender
    recordAccountActivityData(from, asset.id, fromBalance.valueExact, asset.decimals, false);
  }

  if (event.params.to.equals(Address.zero())) {
    asset.totalSupplyExact = asset.totalSupplyExact.minus(eventTransfer.valueExact);
    asset.totalSupply = toDecimals(asset.totalSupplyExact, asset.decimals);

    burnedAmount = eventTransfer.valueExact;
    transferredAmount = BigInt.zero();
  } else {
    to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(asset.id, to), asset.id, to.id, asset.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, asset.decimals);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;

    // Record account activity for receiver
    recordAccountActivityData(to, asset.id, toBalance.valueExact, asset.decimals, false);
  }

  eventTransfer.save();
  asset.save();

  // Record transfer data
  recordTransferData(asset.id, eventTransfer.valueExact, asset.decimals, from, to);

  // Record supply data
  recordAssetSupplyData(asset.id, asset.totalSupplyExact, asset.decimals, assetType);

  // Record stablecoin metrics
  recordAssetMetricsData?.(asset, event.block.timestamp);

  // Record asset activity
  recordAssetActivityData(asset.id, mintedAmount, burnedAmount, transferredAmount, asset.decimals, assetType);
}
