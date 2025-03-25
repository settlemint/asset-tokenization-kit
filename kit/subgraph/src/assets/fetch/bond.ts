import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Bond,
  CryptoCurrency,
  Equity,
  Fund,
  StableCoin,
  TokenizedDeposit,
} from "../../../generated/schema";
import { Bond as BondContract } from "../../../generated/templates/Bond/Bond";
import { CryptoCurrency as CryptoCurrencyContract } from "../../../generated/templates/CryptoCurrency/CryptoCurrency";
import { Equity as EquityContract } from "../../../generated/templates/Equity/Equity";
import { Fund as FundContract } from "../../../generated/templates/Fund/Fund";
import { StableCoin as StableCoinContract } from "../../../generated/templates/StableCoin/StableCoin";
import { TokenizedDeposit as TokenizedDepositContract } from "../../../generated/templates/TokenizedDeposit/TokenizedDeposit";
import { fetchAccount } from "../../fetch/account";
import { toDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { updateDerivedFields } from "../bond";
import { fetchCryptoCurrency } from "./cryptocurrency";
import { fetchEquity } from "./equity";
import { fetchFund } from "./fund";
import { fetchStableCoin } from "./stablecoin";
import { fetchTokenizedDeposit } from "./tokenizeddeposit";

function determineAssetType(address: Address): string {
  // Try to determine the asset type by calling unique functions for each type
  let stableCoinContract = StableCoinContract.bind(address);
  let cryptoCurrencyContract = CryptoCurrencyContract.bind(address);
  let equityContract = EquityContract.bind(address);
  let fundContract = FundContract.bind(address);
  let tokenizedDepositContract = TokenizedDepositContract.bind(address);

  // Try StableCoin-specific function
  let liveness = stableCoinContract.try_liveness();
  if (!liveness.reverted) {
    return AssetType.stablecoin;
  }

  // Try CryptoCurrency-specific function
  let totalSupply = cryptoCurrencyContract.try_totalSupply();
  if (!totalSupply.reverted) {
    return AssetType.cryptocurrency;
  }

  // Try Equity-specific function
  let delegates = equityContract.try_delegates(Address.zero());
  if (!delegates.reverted) {
    return AssetType.equity;
  }

  // Try Fund-specific function
  let managementFeeBps = fundContract.try_managementFeeBps();
  if (!managementFeeBps.reverted) {
    return AssetType.fund;
  }

  // Try TokenizedDeposit-specific function
  let tokenizedDepositLiveness = tokenizedDepositContract.try_liveness();
  if (!tokenizedDepositLiveness.reverted) {
    return AssetType.tokenizeddeposit;
  }

  // Default to stablecoin if we can't determine the type
  // This is a reasonable default since most underlying assets will be stablecoins
  return AssetType.stablecoin;
}

function fetchUnderlyingAsset(
  address: Address
): StableCoin | CryptoCurrency | Equity | Fund | TokenizedDeposit | null {
  if (address == Address.zero()) {
    return null;
  }

  let assetType = determineAssetType(address);

  switch (assetType) {
    case AssetType.stablecoin:
      return fetchStableCoin(address);
    case AssetType.cryptocurrency:
      return fetchCryptoCurrency(address);
    case AssetType.equity:
      return fetchEquity(address);
    case AssetType.fund:
      return fetchFund(address);
    case AssetType.tokenizeddeposit:
      return fetchTokenizedDeposit(address);
    default:
      return fetchStableCoin(address);
  }
}

export function fetchBond(
  address: Address,
  timestamp: BigInt = BigInt.zero()
): Bond {
  let bond = Bond.load(address);
  if (!bond) {
    let endpoint = BondContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let maturityDate = endpoint.try_maturityDate();
    let isMatured = endpoint.try_isMatured();
    let paused = endpoint.try_paused();
    let cap = endpoint.try_cap();
    let faceValue = endpoint.try_faceValue();
    let underlyingAsset = endpoint.try_underlyingAsset();
    let yieldSchedule = endpoint.try_yieldSchedule();

    const account = fetchAccount(address);

    bond = new Bond(address);
    bond.type = AssetType.bond;
    bond.asAccount = account.id;
    bond.name = name.reverted ? "" : name.value;
    bond.symbol = symbol.reverted ? "" : symbol.value;
    bond.decimals = decimals.reverted ? 18 : decimals.value;
    bond.totalSupplyExact = BigInt.zero();
    bond.totalSupply = BigDecimal.zero();
    bond.admins = [];
    bond.supplyManagers = [];
    bond.userManagers = [];
    bond.lastActivity = BigInt.zero();
    bond.creator = Address.zero();
    bond.totalBurned = BigDecimal.zero();
    bond.totalBurnedExact = BigInt.zero();
    bond.totalHolders = 0;
    bond.deployedOn = timestamp;

    // Bond-specific fields
    bond.capExact = cap.reverted ? BigInt.zero() : cap.value;
    bond.cap = toDecimals(bond.capExact, bond.decimals);
    bond.maturityDate = maturityDate.reverted
      ? BigInt.zero()
      : maturityDate.value;
    bond.isMatured = isMatured.reverted ? false : isMatured.value;
    bond.paused = paused.reverted ? false : paused.value;
    bond.faceValue = faceValue.reverted ? BigInt.zero() : faceValue.value;

    // Fetch the underlying asset entity
    let underlyingAssetAddress = underlyingAsset.reverted
      ? Address.zero()
      : underlyingAsset.value;
    if (underlyingAssetAddress != Address.zero()) {
      let assetType = determineAssetType(underlyingAssetAddress);
      let underlyingAssetEntity = null;

      switch (assetType) {
        case AssetType.stablecoin:
          underlyingAssetEntity = fetchStableCoin(underlyingAssetAddress);
          break;
        case AssetType.cryptocurrency:
          underlyingAssetEntity = fetchCryptoCurrency(underlyingAssetAddress);
          break;
        case AssetType.equity:
          underlyingAssetEntity = fetchEquity(underlyingAssetAddress);
          break;
        case AssetType.fund:
          underlyingAssetEntity = fetchFund(underlyingAssetAddress);
          break;
        case AssetType.tokenizeddeposit:
          underlyingAssetEntity = fetchTokenizedDeposit(underlyingAssetAddress);
          break;
        default:
          underlyingAssetEntity = fetchStableCoin(underlyingAssetAddress);
      }

      if (underlyingAssetEntity) {
        bond.underlyingAsset = underlyingAssetEntity;
      }
    }

    bond.redeemedAmount = BigInt.zero();
    bond.underlyingBalance = BigInt.zero();
    bond.yieldSchedule = yieldSchedule.reverted ? null : yieldSchedule.value;
    bond.totalUnderlyingNeededExact = BigInt.zero();
    bond.totalUnderlyingNeeded = BigDecimal.zero();
    bond.hasSufficientUnderlying = false;
    updateDerivedFields(bond);
    bond.save();

    account.asAsset = bond.id;
    account.save();
  }
  return bond;
}
