# ATK Centralized Access Control Integration Guide

## Overview

This guide explains how to integrate the new centralized access control system into ATK contracts. The system implements the role hierarchy defined in the requirements with People roles (MANAGER_ROLE) and System roles (MODULE_ROLE).

## Architecture

```
┌─────────────────────────────────────────┐
│        ATKSystemAccessManager           │
│    (Centralized Role Management)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     ATKSystemAccessControlled           │
│     (Base Contract with Modifiers)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Your System Contracts           │
│    (Inherit ATKSystemAccessControlled)  │
└─────────────────────────────────────────┘
```

## Role Hierarchy

### People Roles (MANAGER_ROLE)
- **DEFAULT_ADMIN_ROLE**: Sets all other roles
- **SYSTEM_MANAGER_ROLE**: Bootstraps system, manages upgrades, implementation references
- **IDENTITY_MANAGER_ROLE**: Register identities, recover identities, manage user onboarding
- **TOKEN_MANAGER_ROLE**: Deploy and configure tokens
- **COMPLIANCE_MANAGER_ROLE**: Register compliance modules, configure global settings, manage bypass list
- **ADDON_MANAGER_ROLE**: Manage addon factories
- **CLAIM_POLICY_MANAGER_ROLE**: Manage trusted issuers and claim topics
- **AUDITOR_ROLE**: View-only access to system state

### System Roles (MODULE_ROLE)
- **SYSTEM_MODULE_ROLE**: Register compliance modules, access to register topic schemes, roleAdmin of other module roles
- **IDENTITY_REGISTRY_MODULE_ROLE**: Modify storage on identity storage modifier
- **TOKEN_FACTORY_REGISTRY_MODULE_ROLE**: RoleAdmin of TOKEN_FACTORY_ROLE
- **TOKEN_FACTORY_MODULE_ROLE**: Add token contracts to compliance allow list
- **ADDON_REGISTRY_MODULE_ROLE**: RoleAdmin of ADDON_ROLE
- **ADDON_MODULE_ROLE**: Add add-on instance contracts to compliance allow list

## Integration Steps

### 1. Deploy the Access Manager

```solidity
// Deploy implementation
ATKSystemAccessManagerImplementation impl = new ATKSystemAccessManagerImplementation(forwarder);

// Deploy proxy
bytes memory initData = abi.encodeWithSelector(
    ATKSystemAccessManagerImplementation.initialize.selector,
    initialAdmin
);
ATKSystemAccessManagerProxy proxy = new ATKSystemAccessManagerProxy(address(impl), initData);

// Cast to interface
IATKSystemAccessManager accessManager = IATKSystemAccessManager(address(proxy));
```

### 2. Inherit Access Controlled Base

```solidity
// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { ATKSystemAccessControlled } from "./access-manager/ATKSystemAccessControlled.sol";
import { ATKSystemRoles } from "./ATKSystemRoles.sol";

contract YourSystemContract is ATKSystemAccessControlled {

    function initialize(address _systemAccessManager) external {
        _setSystemAccessManager(_systemAccessManager);
    }

    // Example function using the onlyRoles pattern
    function manageSystem() external onlySystemManagerOrModule() {
        // Implementation
    }

    // Example function using specific role modifiers
    function registerIdentity() external onlyIdentityManagerOrModule() {
        // Implementation
    }

    // Example function using custom onlyRoles modifier
    function complexOperation() external onlyRoles(
        ATKSystemRoles.SYSTEM_MANAGER_ROLE,
        _getSystemModuleRoles()
    ) {
        // Implementation
    }

    function _getSystemModuleRoles() private pure returns (bytes32[] memory) {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = ATKSystemRoles.SYSTEM_MODULE_ROLE;
        roles[1] = ATKSystemRoles.IDENTITY_REGISTRY_MODULE_ROLE;
        return roles;
    }
}
```

### 3. Available Modifiers

#### Basic Modifiers
```solidity
onlySystemManagerOrModule()           // System operations
onlyIdentityManagerOrModule()         // Identity operations
onlyTokenManagerOrModule()            // Token operations
onlyComplianceManagerOrModule()       // Compliance operations
onlyClaimPolicyManagerOrModule()      // Claim policy operations
onlyAddonManagerOrModule()            // Addon operations
onlyAuditor()                         // Read-only access
onlyDefaultAdmin()                    // Admin operations
```

#### Flexible onlyRoles Modifier
```solidity
// Check manager role OR any of the module roles
modifier onlyRoles(bytes32 managerRole, bytes32[] memory moduleRoles)

// Example usage:
function myFunction() external onlyRoles(
    ATKSystemRoles.SYSTEM_MANAGER_ROLE,
    _getModuleRoles()
) {
    // Implementation
}
```

### 4. Role Management Examples

#### Grant Roles
```solidity
// Grant single role
accessManager.grantRole(ATKSystemRoles.SYSTEM_MANAGER_ROLE, managerAddress);

// Grant multiple roles to one account
bytes32[] memory roles = new bytes32[](3);
roles[0] = ATKSystemRoles.IDENTITY_MANAGER_ROLE;
roles[1] = ATKSystemRoles.TOKEN_MANAGER_ROLE;
roles[2] = ATKSystemRoles.COMPLIANCE_MANAGER_ROLE;
accessManager.grantMultipleRoles(operatorAddress, roles);

// Grant one role to multiple accounts
address[] memory accounts = new address[](3);
accounts[0] = operator1;
accounts[1] = operator2;
accounts[2] = operator3;
accessManager.batchGrantRole(ATKSystemRoles.AUDITOR_ROLE, accounts);
```

#### Query Roles
```solidity
// Check single role
bool hasRole = accessManager.hasRole(ATKSystemRoles.SYSTEM_MANAGER_ROLE, account);

// Check any of multiple roles
bytes32[] memory roles = new bytes32[](2);
roles[0] = ATKSystemRoles.SYSTEM_MANAGER_ROLE;
roles[1] = ATKSystemRoles.SYSTEM_MODULE_ROLE;
bool hasAnyRole = accessManager.hasAnyRole(account, roles);

// Check all roles
bool hasAllRoles = accessManager.hasAllRoles(account, roles);
```

## Migration from Legacy System

### 1. Update System Implementation

Add the access manager reference to your system:

```solidity
contract ATKSystemImplementation is ATKSystemAccessControlled {

    function setSystemAccessManager(address _accessManager)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setSystemAccessManager(_accessManager);
    }

    // Update existing functions to use new modifiers
    function bootstrap() external onlySystemManagerOrModule() {
        // Existing implementation
    }
}
```

### 2. Update Component Contracts

Replace direct role checks with modifier usage:

```solidity
// Before
modifier onlyRole(bytes32 role) {
    require(hasRole(role, msg.sender), "Access denied");
    _;
}

// After
// Remove the modifier, inherit ATKSystemAccessControlled, use built-in modifiers
```

### 3. Bootstrap Process Updates

Update the bootstrap process to deploy and configure the access manager:

```solidity
function bootstrap() external onlySystemManagerOrModule() {
    // ... existing bootstrap logic ...

    // Deploy system access manager if not already deployed
    if (address(systemAccessManager) == address(0)) {
        _deploySystemAccessManager();
    }

    // Grant initial roles
    _setupInitialRoles();
}

function _deploySystemAccessManager() internal {
    // Deploy implementation and proxy
    // Set initial roles
}
```

## Best Practices

### 1. Role Granularity
- Use specific role modifiers when possible
- Use `onlyRoles` for complex permission scenarios
- Consider read-only operations for auditors

### 2. Error Handling
- Always check if access manager is set before operations
- Use consistent error messages
- Provide clear error context

### 3. Gas Optimization
- Cache role arrays for repeated use
- Use appropriate modifiers (don't create arrays unnecessarily)
- Consider view functions for role checks

### 4. Security
- Always validate access manager address is not zero
- Use the least privileged role for operations
- Audit role hierarchies regularly

## Testing Examples

```solidity
contract TestSystemContract is Test {
    ATKSystemAccessManagerImplementation accessManager;
    YourSystemContract systemContract;
    address admin = makeAddr("admin");
    address manager = makeAddr("manager");

    function setUp() public {
        // Deploy access manager
        accessManager = new ATKSystemAccessManagerImplementation(address(0));
        accessManager.initialize(admin);

        // Deploy system contract
        systemContract = new YourSystemContract();
        systemContract.initialize(address(accessManager));

        // Grant roles
        vm.prank(admin);
        accessManager.grantRole(ATKSystemRoles.SYSTEM_MANAGER_ROLE, manager);
    }

    function testSystemManagerCanManageSystem() public {
        vm.prank(manager);
        systemContract.manageSystem(); // Should succeed
    }

    function testUnauthorizedCannotManageSystem() public {
        vm.prank(makeAddr("unauthorized"));
        vm.expectRevert(ATKSystemAccessControlled.NoValidRoleFound.selector);
        systemContract.manageSystem(); // Should fail
    }
}
```

## Next Steps

1. **Update existing contracts** to inherit `ATKSystemAccessControlled`
2. **Deploy the access manager** during system bootstrap
3. **Grant initial roles** to appropriate accounts
4. **Test thoroughly** with the new access control system
5. **Document role assignments** for your specific deployment

This centralized access control system provides the flexibility and security needed for the ATK system while maintaining compatibility with existing patterns.