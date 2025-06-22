import { createServerIpfsClient } from "@settlemint/sdk-ipfs";

export const { client } = createServerIpfsClient({
  instance: process.env.SETTLEMINT_IPFS_API_ENDPOINT!,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
});