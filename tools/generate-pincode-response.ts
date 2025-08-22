#!/usr/bin/env bun

import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Load environment variables manually
function loadEnvFile(path: string): void {
  try {
    const content = readFileSync(path, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match && match[1] && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    });
  } catch (error) {
    // File doesn't exist, ignore
  }
}

// Load environment variables
loadEnvFile('./kit/dapp/.env.local');
loadEnvFile('./kit/dapp/.env');

interface ChallengeData {
  salt: string;
  secret: string;
}

interface VerificationChallenge {
  id: string;
  name: string;
  verificationType: string;
  challenge: ChallengeData;
}

interface GraphQLResponse {
  data?: {
    createVerificationChallenge?: VerificationChallenge;
  };
  errors?: Array<{ message: string }>;
}

/**
 * Generates a challenge response for pincode verification using cryptographic hashing.
 *
 * @remarks
 * SECURITY: Implements two-phase hashing to prevent rainbow table attacks and ensure
 * verification codes cannot be reverse-engineered from network traffic. The salt
 * prevents precomputed hash attacks, while the secret adds server-side entropy.
 *
 * @param pincode - User's numerical pincode (validated elsewhere for length/format)
 * @param salt - Random salt from Portal verification challenge (prevents rainbow tables)
 * @param secret - Server-generated secret from Portal (adds entropy, prevents replay attacks)
 * @returns SHA256 hash of the salted pincode combined with secret for Portal verification
 */
function generatePincodeResponse(pincode: string, salt: string, secret: string): string {
  // PHASE 1: Salt the pincode to prevent rainbow table attacks
  const hashedPincode = createHash("sha256")
    .update(`${salt}${pincode}`)
    .digest("hex");
  // PHASE 2: Combine with server secret to prevent replay attacks
  return createHash("sha256")
    .update(`${hashedPincode}_${secret}`)
    .digest("hex");
}

/**
 * Creates a verification challenge via Portal API using fetch
 * @param userWalletAddress - The user's wallet address
 * @returns Challenge object with id, salt, and secret
 */
async function createVerificationChallenge(userWalletAddress: string): Promise<VerificationChallenge> {
  const portalEndpoint = process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT;
  const accessToken = process.env.SETTLEMINT_ACCESS_TOKEN;
  
  if (!portalEndpoint) {
    throw new Error('SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT environment variable is required');
  }

  const query = `
    mutation CreateVerificationChallenge($userWalletAddress: String!, $verificationType: WalletVerificationType!) {
      createVerificationChallenge(
        userWalletAddress: $userWalletAddress
        verificationType: $verificationType
      ) {
        id
        name
        verificationType
        challenge {
          salt
          secret
        }
      }
    }
  `;

  const variables = {
    userWalletAddress,
    verificationType: 'PINCODE'
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': `atk-pincode-${randomUUID()}`,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(portalEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!response.ok) {
    throw new Error(`Portal API request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json() as GraphQLResponse;
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }
  
  if (!result.data?.createVerificationChallenge) {
    throw new Error('Failed to create verification challenge');
  }

  return result.data.createVerificationChallenge;
}

/**
 * Generate complete pincode challenge response
 * @param pincode - The user's pincode
 * @param userWalletAddress - The user's wallet address
 */
async function generateCompletePincodeResponse(pincode: string, userWalletAddress: string): Promise<{ challengeId: string; challengeResponse: string }> {
  try {
    console.log('Creating verification challenge...');
    const challenge = await createVerificationChallenge(userWalletAddress);
    
    if (!challenge.challenge || !challenge.challenge.salt || !challenge.challenge.secret) {
      throw new Error('Invalid challenge response - missing salt or secret');
    }

    console.log('Challenge created successfully:');
    console.log('- Challenge ID:', challenge.id);
    console.log('- Salt:', challenge.challenge.salt);
    console.log('- Secret:', challenge.challenge.secret);
    
    const challengeResponse = generatePincodeResponse(
      pincode,
      challenge.challenge.salt,
      challenge.challenge.secret
    );

    console.log('\nGenerated Challenge Response:', challengeResponse);
    console.log('\nFor GraphQL mutation, use:');
    console.log('- challengeId:', challenge.id);
    console.log('- challengeResponse:', challengeResponse);

    return {
      challengeId: challenge.id,
      challengeResponse
    };
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// CLI usage
if (import.meta.main) {
  const args = process.argv.slice(2);
  
  if (args.length === 2) {
    // New usage: pincode + wallet address
    const [pincode, userWalletAddress] = args;
    if (pincode && userWalletAddress) {
      await generateCompletePincodeResponse(pincode, userWalletAddress);
    }
  } else if (args.length === 3) {
    // Legacy usage: pincode + salt + secret
    const [pincode, salt, secret] = args;
    if (pincode && salt && secret) {
      const response = generatePincodeResponse(pincode, salt, secret);
      console.log('Pincode Response:', response);
    }
  } else {
    console.error('Usage:');
    console.error('  bun tools/generate-pincode-response.ts <pincode> <userWalletAddress>');
    console.error('  bun tools/generate-pincode-response.ts <pincode> <salt> <secret>');
    console.error('');
    console.error('Examples:');
    console.error('  bun tools/generate-pincode-response.ts 123456 0x742d35Cc47B72b5B85C32Eb8fD29De32');
    console.error('  bun tools/generate-pincode-response.ts 123456 "salt123" "secret456"');
    process.exit(1);
  }
}

export { generatePincodeResponse, createVerificationChallenge, generateCompletePincodeResponse };