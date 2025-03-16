import { portalClient, portalGraphql } from '@/lib/settlemint/portal';

const SetPinCode = portalGraphql(`
  mutation SetPinCode($name: String!, $address: String!, $pincode: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {pincode: {name: $name, pincode: $pincode}}
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

export const setPinCode = async ({
  name,
  address,
  pincode,
}: {
  name: string;
  address: string;
  pincode: string;
}) => {
  const result = await portalClient.request(SetPinCode, {
    name,
    address,
    pincode,
  });

  return result.createWalletVerification;
};
