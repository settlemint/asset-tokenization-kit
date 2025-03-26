import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Deposit } from "../../../generated/schema";
import { Deposit as DepositContract } from "../../../generated/templates/Deposit/Deposit";
import { fetchAccount } from "../../fetch/account";
import { toDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";

export function fetchDeposit(address: Address): Deposit {
  let deposit = Deposit.load(address);

  if (deposit == null) {
    let endpoint = DepositContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let paused = endpoint.try_paused();
    let totalSupply = endpoint.try_totalSupply();
    let liveness = endpoint.try_liveness();

    const account = fetchAccount(address);

    deposit = new Deposit(address);
    deposit.type = AssetType.deposit;
    deposit.asAccount = account.id;
    deposit.name = name.reverted ? "" : name.value;
    deposit.symbol = symbol.reverted ? "" : symbol.value;
    deposit.decimals = decimals.reverted ? 18 : decimals.value;
    deposit.totalSupplyExact = totalSupply.reverted
      ? BigInt.zero()
      : totalSupply.value;
    deposit.totalSupply = toDecimals(
      deposit.totalSupplyExact,
      deposit.decimals
    );
    deposit.lastActivity = BigInt.zero();
    deposit.creator = Address.zero();
    deposit.totalBurnedExact = BigInt.zero();
    deposit.totalBurned = BigDecimal.zero();
    deposit.totalHolders = 0;
    deposit.concentration = BigDecimal.zero();
    deposit.deployedOn = BigInt.zero();
    deposit.paused = paused.reverted ? false : paused.value;
    deposit.liveness = liveness.reverted ? BigInt.zero() : liveness.value;

    // Initialize arrays for access control roles
    deposit.admins = [];
    deposit.supplyManagers = [];
    deposit.userManagers = [];

    // Add collateral related fields
    deposit.collateralExact = BigInt.zero();
    deposit.collateral = BigDecimal.zero();
    deposit.freeCollateral = BigDecimal.zero();
    deposit.freeCollateralExact = BigInt.zero();
    deposit.collateralRatio = BigDecimal.zero();
    deposit.lastCollateralUpdate = BigInt.zero();

    deposit.save();

    account.asAsset = deposit.id;
    account.save();
  }

  return deposit;
}
