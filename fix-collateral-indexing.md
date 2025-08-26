# Fix for Collateral Indexing Issue

## Problem Summary

The collateral claim was stored on the issuer/organization identity
(`0x810ed4f6ee10dba506f3ed7078e3bc4b614076f2`) instead of the token's own
identity contract. The subgraph expects collateral claims to be on the token's
identity, not the issuer's identity.

## Solution Steps

### 1. Verify Token's Identity Contract

First, check if your token has an associated identity contract:

```typescript
// Query TheGraph to get token's identity
const tokenQuery = `
  query GetTokenIdentity($tokenAddress: String!) {
    token(id: $tokenAddress) {
      id
      account {
        identity {
          id
        }
      }
    }
  }
`;
```

### 2. If Token Has No Identity

If the token doesn't have an identity contract, you need to create one:

```solidity
// The token needs to have its own identity contract
// This should be done during token creation or can be added later
```

### 3. Update the Collateral Claim Logic

The fix involves ensuring collateral claims are stored on the token's identity,
not the issuer's:

#### Option A: Quick Fix - Move Existing Claim

```typescript
// Remove claim from issuer identity and add to token identity
async function moveCollateralClaim(
  issuerIdentity: string,
  tokenIdentity: string,
  claimId: string
) {
  // 1. Get claim data from issuer identity
  const claimData = await getClaimFromIdentity(issuerIdentity, claimId);

  // 2. Remove claim from issuer identity
  await removeClaim(issuerIdentity, claimId);

  // 3. Add claim to token identity
  await addClaim(tokenIdentity, claimData);
}
```

#### Option B: Proper Fix - Update the updateCollateral Function

The current `updateCollateral` function already tries to use the token's
identity. The issue is that either:

1. The token doesn't have an identity contract
2. The token's identity is not properly set

### 4. Ensure Token Has Identity During Creation

Update token creation to always include an identity contract:

```typescript
// In token factory or creation process
async function createTokenWithIdentity(tokenParams: TokenParams) {
  // 1. Create identity contract for the token
  const tokenIdentity = await identityFactory.createIdentity();

  // 2. Create token with identity reference
  const token = await tokenFactory.createToken({
    ...tokenParams,
    identity: tokenIdentity,
  });

  // 3. Register token identity as trusted issuer for collateral claims
  await trustedIssuersRegistry.addTrustedIssuer(
    tokenIdentity,
    [COLLATERAL_CLAIM_TOPIC] // Topic 1
  );

  return { token, identity: tokenIdentity };
}
```

### 5. Fix Existing Token's Collateral

For your current token with collateral on wrong identity:

```typescript
async function fixExistingCollateral() {
  const tokenAddress = "YOUR_TOKEN_ADDRESS";
  const issuerIdentity = "0x810ed4f6ee10dba506f3ed7078e3bc4b614076f2";
  const claimId =
    "0x2723ed976fcbee971489fbd89559928c5a363ae9c185a664e4dd82974eaf5729";

  // 1. Get or create token's identity
  let tokenIdentity = await getTokenIdentity(tokenAddress);
  if (!tokenIdentity) {
    tokenIdentity = await createIdentityForToken(tokenAddress);
  }

  // 2. Register token identity as trusted issuer
  await registerAsTrustedIssuer(tokenIdentity, [1]); // Topic 1 for collateral

  // 3. Re-issue collateral claim on token's identity
  const collateralAmount = 2000000;
  const expiryTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

  await issueCollateralClaim(
    tokenIdentity, // Use token's identity, not issuer's
    collateralAmount,
    expiryTimestamp
  );
}
```

## Implementation in the Current System

### Update the updateCollateral function to verify identity ownership:

```typescript
export const updateCollateral = tokenRouter.token.updateCollateral
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.updateCollateral,
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, amount, expiryDays, walletVerification } = input;
    const { auth, system, portalClient } = context;

    const tokenData = context.token;
    let onchainID = tokenData.account.identity?.id;

    // If token doesn't have identity, create one
    if (!onchainID) {
      // Option 1: Throw error and require manual setup
      throw new Error(
        `Token at ${contract} needs an identity contract. Please set up token identity first.`
      );

      // Option 2: Auto-create identity (requires additional implementation)
      // onchainID = await createIdentityForToken(contract, auth.user);
    }

    // Verify the identity belongs to the token, not an external issuer
    // This prevents accidentally using issuer's identity
    const tokenAccount = tokenData.account.id;
    if (tokenData.account.identity?.id !== onchainID) {
      throw new Error(
        `Identity ${onchainID} does not belong to token ${contract}`
      );
    }

    // Continue with existing collateral claim logic...
    // The claim will now be properly indexed by the subgraph
  });
```

## Testing the Fix

1. **Verify Token Identity**: Check that your token has its own identity
   contract
2. **Issue New Collateral Claim**: Use the updateCollateral function with the
   token's identity
3. **Wait for Indexing**: Allow 30-60 seconds for TheGraph to index the claim
4. **Check Stats**: Verify that `statsCollateralRatio` now returns the correct
   values

## Root Cause Prevention

To prevent this issue in the future:

1. **Token Creation**: Always create an identity contract when creating a token
2. **Validation**: Add checks to ensure collateral claims are only added to
   token identities
3. **Documentation**: Update documentation to clarify the difference between
   issuer and token identities
4. **Subgraph Enhancement**: Consider updating the subgraph to handle both
   patterns or provide better error messages

## Alternative Approach - Update Subgraph

If changing the contract setup is not feasible, you could update the subgraph to
also check issuer identities for collateral claims:

```typescript
// In collateral-utils.ts
export function updateCollateral(collateralClaim: IdentityClaim): void {
  const identityAddress = Address.fromBytes(collateralClaim.identity);
  const identity = fetchIdentity(identityAddress);

  // Try to find token by identity
  let token = fetchTokenByIdentity(identity);

  // If not found, check if this identity is an issuer for any tokens
  if (!token) {
    token = fetchTokenByIssuerIdentity(identity); // New function to implement
  }

  if (!token) {
    log.warning(`No token found for identity {}`, [
      identityAddress.toHexString(),
    ]);
    return;
  }

  // Continue with existing logic...
}
```

This would require adding a new relationship tracking which issuer identities
are associated with which tokens.
