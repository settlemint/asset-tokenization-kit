# Integration Test Permission Issues - Root Cause Analysis

## Summary

The integration tests are failing due to missing role grants in the test setup
process. While the system creator receives administrative roles that allow them
to grant other roles, the test setup does not perform these necessary role
grants.

## Root Cause

### Current Test Setup Flow (Incomplete)

The test setup in `kit/dapp/test/scripts/setup.ts` performs:

1. Creates users (admin, investor, issuer)
2. Bootstraps system via `orpc.system.create`
3. Creates token factories

### System Creator Roles

When a system is created via `ATKSystemFactory.createSystem()`, the system
creator is granted:

- **DEFAULT_ADMIN_ROLE**: Can grant any role to any address
- **SYSTEM_MANAGER_ROLE**: Can manage system upgrades, implementations, and
  register token factories, addons, and compliance modules

### Missing Role Grants

Despite having DEFAULT_ADMIN_ROLE (which gives permission to grant roles), the
test setup does not grant the additional roles required for operations:

- **identityManagerRole**: Required to register identities
- **complianceManagerRole**: Required to configure compliance modules
- **tokenManagerRole**: Required to create tokens (via `_deployToken` which has
  `onlySystemRole(TOKEN_MANAGER_ROLE)`)
- **addonManagerRole**: Required to configure addons

### Why Roles Aren't Granted

1. The `system.create` API implementation correctly grants DEFAULT_ADMIN_ROLE
   and SYSTEM_MANAGER_ROLE to the system creator
2. However, it does NOT automatically grant the operational roles
   (tokenManagerRole, identityManagerRole, etc.)
3. The `bootstrapSystem` function incorrectly assumes roles are already granted:
   ```typescript
   // No need to grant permissions anymore as it's already done in the Ignition module
   console.log("✓ Permissions already granted during system bootstrap");
   ```

## Impact

The missing role grants cause permission failures when tests attempt to:

- Manage identities (requires `identityManagerRole`)
- Configure compliance modules (requires `complianceManagerRole`)
- Create and manage tokens (requires `tokenManagerRole`)
- Configure addons (requires `addonManagerRole`)

## Verification

Through code analysis and Gemini CLI verification:

1. **Smart Contract Analysis**: The system creator receives DEFAULT_ADMIN_ROLE
   and SYSTEM_MANAGER_ROLE from `ATKSystemFactory.createSystem()`
2. **Role Requirements**: Token creation requires TOKEN_MANAGER_ROLE (enforced
   in `AbstractATKTokenFactoryImplementation._deployToken()`)
3. **Admin Capabilities**: DEFAULT_ADMIN_ROLE can grant any role via
   `grantMultipleRoles()`
4. **Test Gap**: The test setup doesn't grant the operational roles despite
   having the permission to do so

## Required Solution

The test setup needs to grant the operational roles after system creation:

1. Grant `identityManagerRole` to the admin user (for identity registration)
2. Grant `complianceManagerRole` to the admin user (for compliance
   configuration)
3. Grant `tokenManagerRole` to the admin user (for token creation)
4. Grant `addonManagerRole` to the admin user (for addon configuration)

These role grants should be added to either:

- The `bootstrapSystem` function in `kit/dapp/test/utils/system-bootstrap.ts`
- The `setup` function in `kit/dapp/test/scripts/setup.ts`

The system creator has DEFAULT_ADMIN_ROLE and can grant these roles, but the
test setup must explicitly perform these grants to match the production
deployment flow.
