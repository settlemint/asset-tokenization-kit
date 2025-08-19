import { createServerIpfsClient } from "@settlemint/sdk-ipfs";

// Validate required environment variables
const ipfsApiEndpoint = process.env.SETTLEMINT_IPFS_API_ENDPOINT;

if (!ipfsApiEndpoint) {
  throw new Error("SETTLEMINT_IPFS_API_ENDPOINT environment variable is required");
}

export const { client } = createServerIpfsClient({
  instance: ipfsApiEndpoint,
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
});
