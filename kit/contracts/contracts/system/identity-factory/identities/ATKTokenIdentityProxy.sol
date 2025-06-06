// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { ATKSystemProxy } from "../../ATKSystemProxy.sol";
import { IATKSystem } from "../../IATKSystem.sol";
// import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol"; // No longer needed directly
// import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol"; // No longer needed
// import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol"; // No longer needed
import { IdentityImplementationNotSet } from "../../ATKSystemErrors.sol"; // InvalidSystemAddress,
    // ETHTransfersNotAllowed handled by ATKSystemProxy
import { ZeroAddressNotAllowed } from "../ATKIdentityErrors.sol";
// import { Identity } from "@onchainid/contracts/Identity.sol"; // Not directly used in proxy, but in implementation
// via selector
import { IATKTokenIdentity } from "./IATKTokenIdentity.sol";

/// @title ATK Token Identity Proxy Contract (for Token-Bound Identities)
/// @author SettleMint Tokenization Services
/// @notice This contract serves as an upgradeable proxy for an on-chain identity specifically bound to a token
/// contract.
///         It is based on the ERC725 (OnchainID) standard for identity and uses ERC734 for key management.
/// @dev This proxy contract adheres to EIP-1967 for upgradeability. It holds the token identity's storage
///      (keys, claims, etc.) and its public address, while delegating all logic calls to a
/// `ATKTokenIdentityImplementation` contract.
///      The address of this logic implementation is retrieved from the central `IATKSystem` contract via
/// `tokenIdentityImplementation()`,
///      allowing the underlying token identity logic to be upgraded without changing this proxy's address or losing its
/// state.
///      This proxy is typically created by the `SMARTIdentityFactoryImplementation` for a specific token.
///      Inherits from `SMARTSystemProxy`.
contract ATKTokenIdentityProxy is ATKSystemProxy {
    /// @notice Constructor for the `ATKTokenIdentityProxy`.
    /// @dev This function is called only once when this proxy contract is deployed (typically by the
    /// `ATKIdentityFactory`).
    /// It initializes the proxy and the underlying token identity state:
    /// 1. Stores `systemAddress` (handled by `ATKSystemProxy` constructor).
    /// 2. Validates `accessManager`: Ensures it's not `address(0)`.
    /// 3. Retrieves the `ATKTokenIdentityImplementation` address from the `IATKSystem` contract.
    /// 4. Ensures this implementation address is configured (not `address(0)`), reverting with
    /// `IdentityImplementationNotSet` if not.
    /// 5. Performs a `delegatecall` to the `initialize` function of the `Identity` contract (which
    /// `ATKTokenIdentityImplementation` inherits) via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param accessManager The address of the `ATKTokenAccessManager` contract.
    constructor(address systemAddress, address accessManager) ATKSystemProxy(systemAddress) {
        if (accessManager == address(0)) revert ZeroAddressNotAllowed();

        IATKSystem system_ = _getSystem();
        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data = abi.encodeWithSelector(IATKTokenIdentity.initialize.selector, accessManager);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Token Identity module from the `IATKSystem` contract.
    /// @dev Reverts with `IdentityImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKTokenIdentityImplementation` contract.
    /// @inheritdoc ATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.tokenIdentityImplementation(); // Uses the token-specific implementation getter
        if (implementation == address(0)) {
            revert IdentityImplementationNotSet();
        }
        return implementation;
    }
}
