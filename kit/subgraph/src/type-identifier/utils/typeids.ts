import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";

class TypeId {
  name: string;
  id: Bytes;
}

/**
 * Type IDs for SMART Protocol
 *
 * IWithTypeIdentifier extension mapping
 */
export class TypeIds {
  static typeIds: Array<TypeId> = [
    {
      name: "AddressBlockListComplianceModule",
      id: getTypeId("AddressBlockListComplianceModule"),
    },
    {
      name: "ATKBondFactory",
      id: getTypeId("ATKBondFactory"),
    },
    {
      name: "ATKDepositFactory",
      id: getTypeId("ATKDepositFactory"),
    },
    {
      name: "ATKEquityFactory",
      id: getTypeId("ATKEquityFactory"),
    },
    {
      name: "ATKFundFactory",
      id: getTypeId("ATKFundFactory"),
    },
    {
      name: "ATKFixedYieldScheduleFactory",
      id: getTypeId("ATKFixedYieldScheduleFactory"),
    },
    {
      name: "ATKLinearVestingStrategy",
      id: getTypeId("ATKLinearVestingStrategy"),
    },
    {
      name: "ATKPushAirdropFactory",
      id: getTypeId("ATKPushAirdropFactory"),
    },
    {
      name: "ATKStableCoinFactory",
      id: getTypeId("ATKStableCoinFactory"),
    },
    {
      name: "ATKTimeBoundAirdropFactory",
      id: getTypeId("ATKTimeBoundAirdropFactory"),
    },
    {
      name: "ATKVaultFactory",
      id: getTypeId("ATKVaultFactory"),
    },
    {
      name: "ATKVestingAirdropFactory",
      id: getTypeId("ATKVestingAirdropFactory"),
    },
    {
      name: "ATKVestingStrategy",
      id: getTypeId("ATKVestingStrategy"),
    },
    {
      name: "ATKXvPSettlementFactory",
      id: getTypeId("ATKXvPSettlementFactory"),
    },
    {
      name: "CountryAllowListComplianceModule",
      id: getTypeId("CountryAllowListComplianceModule"),
    },
    {
      name: "CountryBlockListComplianceModule",
      id: getTypeId("CountryBlockListComplianceModule"),
    },
    {
      name: "IdentityAllowListComplianceModule",
      id: getTypeId("IdentityAllowListComplianceModule"),
    },
    {
      name: "IdentityBlockListComplianceModule",
      id: getTypeId("IdentityBlockListComplianceModule"),
    },
    {
      name: "SMARTIdentityVerificationComplianceModule",
      id: getTypeId("SMARTIdentityVerificationComplianceModule"),
    },
    {
      name: "TokenSupplyLimitComplianceModule",
      id: getTypeId("TokenSupplyLimitComplianceModule"),
    },
  ];
}

function getTypeId(name: string): Bytes {
  return Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8(name)));
}
