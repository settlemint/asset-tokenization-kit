#!/usr/bin/env node

// This script deploys an identity contract for an existing token that doesn't have one
import { createPortalClient } from "@settlemint/sdk-portal";

const TOKEN_PROXY = "0x6934ccFa50C220C3d03d819A8FbA471D3DEe9aFb";
const IDENTITY_FACTORY = "0x0175f17Dc5e1a303Ca5addC707EF6dD3a96708c7"; // From your debug info
const YOUR_WALLET = "0x0352E7814715525cbA518724F69dAeEd44354a2d"; // From your debug info

console.log("🔧 Deploying identity contract for token:", TOKEN_PROXY);
console.log("Using identity factory:", IDENTITY_FACTORY);
console.log("Using wallet:", YOUR_WALLET);

const { client: portalClient } = createPortalClient({
  instance: "http://localhost:7701/graphql",
  accessToken: process.env.SETTLEMINT_ACCESS_TOKEN,
});

try {
  // Step 1: Create the contract identity
  console.log("\nStep 1: Creating contract identity...");

  const createIdentityMutation = `
    mutation CreateContractIdentity($factory: String!, $contract: String!, $from: String!) {
      ATKIdentityFactoryImplementationCreateContractIdentity(
        address: $factory
        from: $from
        input: {
          _contract: $contract
        }
      ) {
        transactionHash
      }
    }
  `;

  const createResult = await portalClient.request(createIdentityMutation, {
    factory: IDENTITY_FACTORY,
    contract: TOKEN_PROXY,
    from: YOUR_WALLET,
  });

  const txHash =
    createResult.ATKIdentityFactoryImplementationCreateContractIdentity
      ?.transactionHash;

  if (!txHash) {
    console.log("❌ Failed to create identity - no transaction hash returned");
    process.exit(1);
  }

  console.log("✅ Identity creation transaction:", txHash);
  console.log("\nWaiting for transaction to be mined...");

  // Wait a bit for the transaction to be mined
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Step 2: Get the newly created identity address
  console.log("\nStep 2: Getting identity address...");

  const getIdentityQuery = `
    query GetContractIdentity($factory: String!, $contract: String!) {
      ATKIdentityFactoryImplementation(address: $factory) {
        getContractIdentity(contractAddress: $contract)
      }
    }
  `;

  const identityResult = await portalClient.request(getIdentityQuery, {
    factory: IDENTITY_FACTORY,
    contract: TOKEN_PROXY,
  });

  const identityAddress =
    identityResult.ATKIdentityFactoryImplementation?.getContractIdentity;

  if (
    !identityAddress ||
    identityAddress === "0x0000000000000000000000000000000000000000"
  ) {
    console.log("❌ Identity not found after creation");
    console.log(
      "This might mean the identity already exists or creation failed"
    );
    process.exit(1);
  }

  console.log("✅ Identity contract deployed at:", identityAddress);

  // Step 3: Link the identity to the token using setOnchainID
  console.log("\nStep 3: Linking identity to token...");

  const setOnchainIDMutation = `
    mutation SetOnchainID($token: String!, $identity: String!, $from: String!) {
      ATKStableCoinImplementationSetOnchainID(
        address: $token
        from: $from
        input: {
          _onchainID: $identity
        }
      ) {
        transactionHash
      }
    }
  `;

  const linkResult = await portalClient.request(setOnchainIDMutation, {
    token: TOKEN_PROXY,
    identity: identityAddress,
    from: YOUR_WALLET,
  });

  const linkTxHash =
    linkResult.ATKStableCoinImplementationSetOnchainID?.transactionHash;

  if (!linkTxHash) {
    console.log("❌ Failed to link identity - no transaction hash returned");
    console.log(
      "You may need to manually call setOnchainID with GOVERNANCE_ROLE"
    );
    process.exit(1);
  }

  console.log("✅ SetOnchainID transaction:", linkTxHash);

  console.log("\n🎉 Identity successfully deployed and linked!");
  console.log("Token:", TOKEN_PROXY);
  console.log("Identity:", identityAddress);
  console.log("\nYou can now set collateral claims on this token!");
} catch (error) {
  console.error("\n❌ Error:", error.message);
  if (error.response) {
    console.error("Response:", JSON.stringify(error.response, null, 2));
  }

  // Check if it's a "salt already taken" error
  if (error.message && error.message.includes("SaltAlreadyTaken")) {
    console.log(
      "\n⚠️ This token might already have an identity contract deployed."
    );
    console.log("The identity just needs to be linked using setOnchainID.");

    // Try to get the existing identity
    console.log("\nChecking for existing identity...");

    const getIdentityQuery = `
      query GetContractIdentity($factory: String!, $contract: String!) {
        ATKIdentityFactoryImplementation(address: $factory) {
          getContractIdentity(contractAddress: $contract)
        }
      }
    `;

    try {
      const identityResult = await portalClient.request(getIdentityQuery, {
        factory: IDENTITY_FACTORY,
        contract: TOKEN_PROXY,
      });

      const existingIdentity =
        identityResult.ATKIdentityFactoryImplementation?.getContractIdentity;

      if (
        existingIdentity &&
        existingIdentity !== "0x0000000000000000000000000000000000000000"
      ) {
        console.log("✅ Found existing identity:", existingIdentity);
        console.log(
          "\nYou just need to link it to the token using setOnchainID."
        );
      }
    } catch (e) {
      console.log("Could not check for existing identity");
    }
  } else {
    console.log(
      "\nNote: You need GOVERNANCE_ROLE to deploy identity and set onchainID"
    );
  }

  process.exit(1);
}
