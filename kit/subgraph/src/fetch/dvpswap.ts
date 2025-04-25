import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DvPSwap } from "../../generated/schema";
import { AssetType } from "../utils/enums";
import { fetchAccount } from "./account";

/**
 * Fetches or creates a DvPSwap entity
 * @param address The address of the DvPSwap contract
 * @param timestamp Optional timestamp for the creation time
 * @returns The DvPSwap entity
 */
export function fetchDvPSwap(address: Address, timestamp: BigInt = BigInt.zero()): DvPSwap {
  let dvpSwap = DvPSwap.load(address);

  if (dvpSwap == null) {
    const account = fetchAccount(address);

    dvpSwap = new DvPSwap(address);
    dvpSwap.type = AssetType.dvpswap;
    dvpSwap.asAccount = account.id;
    dvpSwap.name = "DvP Swap";
    dvpSwap.symbol = "DVPS";
    dvpSwap.decimals = 18;  // Standard ERC20 decimals
    dvpSwap.totalSupply = BigInt.zero().toBigDecimal();
    dvpSwap.totalSupplyExact = BigInt.zero();
    dvpSwap.lastActivity = timestamp;
    dvpSwap.creator = account.id;
    dvpSwap.totalBurned = BigInt.zero().toBigDecimal();
    dvpSwap.totalBurnedExact = BigInt.zero();
    dvpSwap.totalHolders = 0;
    dvpSwap.deployedOn = timestamp;
    dvpSwap.concentration = BigInt.zero().toBigDecimal();
    dvpSwap.admins = [];
    dvpSwap.supplyManagers = [];
    dvpSwap.userManagers = [];
    
    // DvPSwap-specific fields
    dvpSwap.paused = false;
    dvpSwap.transactionsCount = BigInt.zero();
    dvpSwap.executedTransactionsCount = BigInt.zero();
    dvpSwap.approvedTransactionsCount = BigInt.zero();
    dvpSwap.cancelledTransactionsCount = BigInt.zero();
    dvpSwap.expiredTransactionsCount = BigInt.zero();
    
    dvpSwap.save();
  }

  return dvpSwap as DvPSwap;
} 