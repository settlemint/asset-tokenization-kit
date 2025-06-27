import { ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts';
import type { GlobalAddressListChange as GlobalAddressListChangeEvent } from '../../../generated/templates/AbstractAddressListComplianceModule/AbstractAddressListComplianceModule';
import { fetchEvent } from '../../event/fetch/event';
import { fetchComplianceModule } from '../fetch/compliance-module';

export function isAddressListComplianceModule(typeId: Bytes): boolean {
  return (
    typeId ==
      crypto.keccak256(
        ByteArray.fromUTF8('AddressBlockListComplianceModule')
      ) ||
    typeId ==
      crypto.keccak256(
        ByteArray.fromUTF8('IdentityAllowListComplianceModule')
      ) ||
    typeId ==
      crypto.keccak256(ByteArray.fromUTF8('IdentityBlockListComplianceModule'))
  );
}

export function decodeAddressListParams(data: Bytes): Array<Bytes> {
  const result: Bytes[] = [];

  let offset = 32;

  const lenBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
  const lenVal = ethereum.decode('uint256', lenBytes);

  if (lenVal === null) {
    return result;
  }

  const arrayLength = lenVal.toBigInt().toI32();
  offset += 32;

  for (let i = 0; i < arrayLength; i++) {
    const addrChunk = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
    const addrBytes = Bytes.fromUint8Array(addrChunk.subarray(12)); // last 20 bytes
    result.push(addrBytes);
    offset += 32;
  }

  return result;
}

export function handleGlobalAddressListChange(
  event: GlobalAddressListChangeEvent
): void {
  fetchEvent(event, 'GlobalAddressListChange');

  const complianceModule = fetchComplianceModule(event.address);
  let addresses = complianceModule.addresses;
  if (!addresses) {
    addresses = [];
  }

  if (event.params.inList) {
    addresses.push(event.params.addr);
  } else {
    const newAddresses: Bytes[] = [];
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i] != event.params.addr) {
        newAddresses.push(addresses[i] as Bytes);
      }
    }
    addresses = newAddresses;
  }
  complianceModule.addresses = addresses;
  complianceModule.save();
}
