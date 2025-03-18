import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { Bond } from "../../../generated/schema";
import { Bond as BondContract } from "../../../generated/templates/Bond/Bond";
import { fetchAccount } from "../../fetch/account";
import { toDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { updateDerivedFields } from "../bond";

export function fetchBond(address: Address): Bond {
  let bond = Bond.load(address);
  if (!bond) {
    let endpoint = BondContract.bind(address);
    log.info("[BOND DEBUG] Fetching bond data for address: {}", [address.toHexString()]);
    
    log.info("[BOND DEBUG] Attempting to access all bond properties...", []);
    
    let name = endpoint.try_name();
    log.info("[BOND DEBUG] name() call - reverted: {}", [name.reverted.toString()]);
    
    let symbol = endpoint.try_symbol();
    log.info("[BOND DEBUG] symbol() call - reverted: {}", [symbol.reverted.toString()]);
    
    let decimals = endpoint.try_decimals();
    log.info("[BOND DEBUG] decimals() call - reverted: {}", [decimals.reverted.toString()]);
    
    let maturityDate = endpoint.try_maturityDate();
    log.info("[BOND DEBUG] maturityDate() call - reverted: {}", [maturityDate.reverted.toString()]);
    
    let isMatured = endpoint.try_isMatured();
    log.info("[BOND DEBUG] isMatured() call - reverted: {}", [isMatured.reverted.toString()]);
    
    let paused = endpoint.try_paused();
    log.info("[BOND DEBUG] paused() call - reverted: {}", [paused.reverted.toString()]);
    
    let cap = endpoint.try_cap();
    log.info("[BOND DEBUG] cap() call - reverted: {}", [cap.reverted.toString()]);
    
    let faceValue = endpoint.try_faceValue();
    log.info("[BOND DEBUG] faceValue() call - reverted: {}", [faceValue.reverted.toString()]);
    
    let underlyingAsset = endpoint.try_underlyingAsset();
    log.info("[BOND DEBUG] underlyingAsset() call - reverted: {}", [underlyingAsset.reverted.toString()]);
    
    // Special debug for yieldSchedule
    log.info("[BOND DEBUG] About to access yieldSchedule for bond: {}", [address.toHexString()]);
    let yieldSchedule = endpoint.try_yieldSchedule();
    
    log.info("[BOND DEBUG] yieldSchedule() call - reverted: {}", [yieldSchedule.reverted.toString()]);
    
    // If the call didn't revert, log the address
    if (!yieldSchedule.reverted) {
      log.info("[BOND DEBUG] yieldSchedule address: {}", [yieldSchedule.value.toHexString()]);
    } else {
      log.error("[BOND DEBUG] yieldSchedule call reverted for bond: {}", [address.toHexString()]);
    }

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

    // Bond-specific fields
    bond.capExact = cap.reverted ? BigInt.zero() : cap.value;
    bond.cap = toDecimals(bond.capExact, bond.decimals);
    bond.maturityDate = maturityDate.reverted
      ? BigInt.zero()
      : maturityDate.value;
    bond.isMatured = isMatured.reverted ? false : isMatured.value;
    bond.paused = paused.reverted ? false : paused.value;
    bond.faceValue = faceValue.reverted ? BigInt.zero() : faceValue.value;
    bond.underlyingAsset = underlyingAsset.reverted
      ? Address.zero()
      : underlyingAsset.value;
    bond.redeemedAmount = BigInt.zero();
    bond.underlyingBalance = BigInt.zero();
    
    // Set yield schedule and log the final value
    bond.yieldSchedule = yieldSchedule.reverted ? null : yieldSchedule.value;
    
    // Fix the logging statement to handle null values correctly in AssemblyScript
    if (bond.yieldSchedule !== null) {
      const scheduleAddress = bond.yieldSchedule as Address;
      log.info("[BOND DEBUG] Final yieldSchedule value in entity: {}", [scheduleAddress.toHexString()]);
    } else {
      log.info("[BOND DEBUG] Final yieldSchedule value in entity: null", []);
    }

    bond.totalUnderlyingNeededExact = BigInt.zero();
    bond.totalUnderlyingNeeded = BigDecimal.zero();
    bond.hasSufficientUnderlying = false;
    bond.deployedOn = BigInt.zero();
    updateDerivedFields(bond);
    bond.save();

    account.asAsset = bond.id;
    account.save();
    
    log.info("[BOND DEBUG] Bond entity created and saved: {}", [address.toHexString()]);
  }
  return bond;
}
