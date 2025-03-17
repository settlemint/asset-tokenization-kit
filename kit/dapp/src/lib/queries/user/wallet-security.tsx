import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { cache } from 'react';

const UserWalletVerifications = portalGraphql(`
  query UserWalletVerifications($userWalletAddress: String = "") {
    getWalletVerifications(userWalletAddress: $userWalletAddress) {
      id
      name
      verificationType
    }
  }
`);

export const getUserWalletVerifications = cache(
  async (userWalletAddress: string) => {
    const result = await portalClient.request(UserWalletVerifications, {
      userWalletAddress,
    });
    return result.getWalletVerifications;
  }
);
