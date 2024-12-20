import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import {
  Account,
  AccountActivityData,
  AssetSupplyData,
  Bond,
  BondMetricsData,
  Equity,
  EquityCategoryData,
  Role,
  RoleActivityData,
  StableCoin,
  StableCoinMetricsData,
  TransferData,
} from '../../generated/schema';

export function recordTransferData(assetId: Bytes, value: BigInt, from: Account | null, to: Account | null): void {
  const transfer = new TransferData('auto');
  transfer.asset = assetId;
  transfer.value = value.toBigDecimal();
  transfer.from = from ? from.id : null;
  transfer.to = to ? to.id : null;
  transfer.save();
}

export function recordAssetSupplyData(assetId: Bytes, totalSupply: BigInt, assetType: string): void {
  const supplyData = new AssetSupplyData('auto');
  supplyData.asset = assetId;
  supplyData.totalSupply = totalSupply.toBigDecimal();
  supplyData.assetType = assetType;
  supplyData.save();
}

export function recordAccountActivityData(account: Account, assetId: Bytes, balance: BigInt, isBlocked: boolean): void {
  const activityData = new AccountActivityData('auto');
  activityData.account = account.id;
  activityData.asset = assetId;
  activityData.balance = balance.toBigDecimal();
  activityData.isBlocked = isBlocked;
  activityData.blockedValue = isBlocked ? 1 : 0;
  activityData.save();
}

export function recordRoleActivityData(assetId: Bytes, role: Role, account: Account, isGranted: boolean): void {
  const roleData = new RoleActivityData('auto');
  roleData.asset = assetId;
  roleData.role = role.id;
  roleData.account = account.id;
  roleData.isGranted = isGranted;
  roleData.grantValue = isGranted ? 1 : 0;
  roleData.revokeValue = isGranted ? 0 : 1;
  roleData.activeValue = isGranted ? 1 : -1;
  roleData.save();
}

export function recordBondMetricsData(bond: Bond, blockTimestamp: BigInt): void {
  const daysToMaturity = bond.maturityDate.minus(blockTimestamp).div(BigInt.fromI32(86400));

  const metricsData = new BondMetricsData('auto');
  metricsData.bond = bond.id;
  metricsData.daysToMaturity = daysToMaturity.toI32();
  metricsData.isMatured = bond.isMatured;
  metricsData.maturedValue = bond.isMatured ? 1 : 0;
  metricsData.save();
}

export function recordStableCoinMetricsData(stableCoin: StableCoin): void {
  const metricsData = new StableCoinMetricsData('auto');
  metricsData.stableCoin = stableCoin.id;
  metricsData.collateralRatio = stableCoin.collateral.div(stableCoin.totalSupply);
  metricsData.save();
}

export function recordEquityCategoryData(equity: Equity): void {
  const categoryData = new EquityCategoryData('auto');
  categoryData.equity = equity.id;
  categoryData.category = equity.equityCategory;
  categoryData.equityClass = equity.equityClass;
  categoryData.save();
}
