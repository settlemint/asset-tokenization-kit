import { Address, Bytes, ethereum, Value } from "@graphprotocol/graph-ts";
import { Internal_AccessControl } from "../../../generated/schema";
import { fetchAccount } from "../account/fetch-account";
import { Roles } from "./role";

export function fetchAccessControl(
  address: Address,
  contract: ethereum.SmartContract | null = null
): Internal_AccessControl {
  const id = address.concat(Bytes.fromUTF8("accesscontrol"));
  let accessControlEntity = Internal_AccessControl.load(id);

  if (!accessControlEntity) {
    accessControlEntity = new Internal_AccessControl(id);

    // This depends on the contract implementing AccessControlEnumerable, it falls back to an empty array if the call fails
    if (contract) {
      for (let i = 0; i < Roles.length; i++) {
        const addresses = getRoleMembers(contract, Roles[i].hexString);
        const accountIds: Bytes[] = [];
        for (let j = 0; j < addresses.length; j++) {
          const accountId = fetchAccount(addresses[j]).id;
          accountIds.push(accountId);
        }
        accessControlEntity.set(
          Roles[i].fieldName,
          Value.fromBytesArray(accountIds)
        );
      }
    } else {
      for (let i = 0; i < Roles.length; i++) {
        accessControlEntity.set(Roles[i].fieldName, Value.fromBytesArray([]));
      }
    }
    accessControlEntity.save();
  }

  return accessControlEntity;
}

function getRoleMembers(
  contract: ethereum.SmartContract,
  role: string
): Address[] {
  const result = contract.tryCall(
    "getRoleMembers",
    "getRoleMembers(bytes32):(address[])",
    [ethereum.Value.fromFixedBytes(Bytes.fromHexString(role))]
  );

  if (result.reverted) {
    return [];
  }

  let value = result.value;
  return value[0].toAddressArray();
}
