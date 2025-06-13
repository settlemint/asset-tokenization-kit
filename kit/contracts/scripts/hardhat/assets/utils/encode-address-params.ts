import { encodeAbiParameters, parseAbiParameters, type Address } from "viem";

export const encodeAddressParams = (addresses: Address[]) => {
  return encodeAbiParameters(parseAbiParameters("address[]"), [addresses]);
};
