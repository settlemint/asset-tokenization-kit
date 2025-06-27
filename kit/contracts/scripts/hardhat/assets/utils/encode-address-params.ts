import { type Address, encodeAbiParameters, parseAbiParameters } from 'viem';

export const encodeAddressParams = (addresses: Address[]) => {
  return encodeAbiParameters(parseAbiParameters('address[]'), [addresses]);
};
