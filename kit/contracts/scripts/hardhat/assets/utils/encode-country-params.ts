import { encodeAbiParameters, parseAbiParameters } from 'viem';

export const encodeCountryParams = (countries: number[]) => {
  return encodeAbiParameters(parseAbiParameters('uint16[]'), [countries]);
};
