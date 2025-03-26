import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { TokenizedDeposit } from "../../../generated/schema";
import { TokenizedDeposit as TokenizedDepositContract } from "../../../generated/templates/TokenizedDeposit/TokenizedDeposit";
import { fetchAccount } from "../../fetch/account";
import { toDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";

export function fetchTokenizedDeposit(address: Address): TokenizedDeposit {
  let tokenizedDeposit = TokenizedDeposit.load(address);

  if (tokenizedDeposit == null) {
    let endpoint = TokenizedDepositContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let paused = endpoint.try_paused();
    let totalSupply = endpoint.try_totalSupply();
    let liveness = endpoint.try_liveness();

    const account = fetchAccount(address);

    tokenizedDeposit = new TokenizedDeposit(address);
    tokenizedDeposit.type = AssetType.tokenizeddeposit;
    tokenizedDeposit.asAccount = account.id;
    tokenizedDeposit.name = name.reverted ? "" : name.value;
    tokenizedDeposit.symbol = symbol.reverted ? "" : symbol.value;
    tokenizedDeposit.decimals = decimals.reverted ? 18 : decimals.value;
    tokenizedDeposit.totalSupplyExact = totalSupply.reverted
      ? BigInt.zero()
      : totalSupply.value;
    tokenizedDeposit.totalSupply = toDecimals(
      tokenizedDeposit.totalSupplyExact,
      tokenizedDeposit.decimals
    );
    tokenizedDeposit.lastActivity = BigInt.zero();
    tokenizedDeposit.creator = Address.zero();
    tokenizedDeposit.totalBurnedExact = BigInt.zero();
    tokenizedDeposit.totalBurned = BigDecimal.zero();
    tokenizedDeposit.totalHolders = 0;
    tokenizedDeposit.concentration = BigDecimal.zero();
    tokenizedDeposit.deployedOn = BigInt.zero();
    tokenizedDeposit.paused = paused.reverted ? false : paused.value;
    tokenizedDeposit.liveness = liveness.reverted
      ? BigInt.zero()
      : liveness.value;

    // Initialize arrays for access control roles
    tokenizedDeposit.admins = [];
    tokenizedDeposit.supplyManagers = [];
    tokenizedDeposit.userManagers = [];

    // Add collateral related fields
    tokenizedDeposit.collateralExact = BigInt.zero();
    tokenizedDeposit.collateral = BigDecimal.zero();
    tokenizedDeposit.freeCollateral = BigDecimal.zero();
    tokenizedDeposit.freeCollateralExact = BigInt.zero();
    tokenizedDeposit.collateralRatio = BigDecimal.zero();
    tokenizedDeposit.lastCollateralUpdate = BigInt.zero();

    tokenizedDeposit.save();

    account.asAsset = tokenizedDeposit.id;
    account.save();
  }

  return tokenizedDeposit;
}
