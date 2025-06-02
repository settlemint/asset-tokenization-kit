// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { SMARTSystemProxy } from "../../SMARTSystemProxy.sol";
import { ISMARTSystem } from "../../ISMARTSystem.sol";
// import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol"; // No longer needed directly
// import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol"; // No longer needed
// import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol"; // No longer needed
import { IdentityImplementationNotSet } from "../../SMARTSystemErrors.sol"; // InvalidSystemAddress,
    // ETHTransfersNotAllowed handled by SMARTSystemProxy
import { ZeroAddressNotAllowed } from "../SMARTIdentityErrors.sol";
// import { Identity } from "@onchainid/contracts/Identity.sol"; // Not directly used in proxy, but in implementation
// via selector
import { ISMARTTokenIdentity } from "./ISMARTTokenIdentity.sol";

/// @title SMART Token Identity Proxy Contract (for Token-Bound Identities)
/// @author SettleMint Tokenization Services
/// @notice This contract serves as an upgradeable proxy for an on-chain identity specifically bound to a token
/// contract.
///         It is based on the ERC725 (OnchainID) standard for identity and uses ERC734 for key management.
/// @dev This proxy contract adheres to EIP-1967 for upgradeability. It holds the token identity's storage
///      (keys, claims, etc.) and its public address, while delegating all logic calls to a
/// `SMARTTokenIdentityImplementation` contract.
///      The address of this logic implementation is retrieved from the central `ISMARTSystem` contract via
/// `tokenIdentityImplementation()`,
///      allowing the underlying token identity logic to be upgraded without changing this proxy's address or losing its
/// state.
///      This proxy is typically created by the `SMARTIdentityFactoryImplementation` for a specific token.
///      Inherits from `SMARTSystemProxy`.
contract SMARTTokenIdentityProxy is SMARTSystemProxy {
    /// @notice Constructor for the `SMARTTokenIdentityProxy`.
    /// @dev This function is called only once when this proxy contract is deployed (typically by the
    /// `SMARTIdentityFactory`).
    /// It initializes the proxy and the underlying token identity state:
    /// 1. Stores `systemAddress` (handled by `SMARTSystemProxy` constructor).
    /// 2. Validates `accessManager`: Ensures it's not `address(0)`.
    /// 3. Retrieves the `SMARTTokenIdentityImplementation` address from the `ISMARTSystem` contract.
    /// 4. Ensures this implementation address is configured (not `address(0)`), reverting with
    /// `IdentityImplementationNotSet` if not.
    /// 5. Performs a `delegatecall` to the `initialize` function of the `Identity` contract (which
    /// `SMARTTokenIdentityImplementation` inherits) via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `ISMARTSystem` contract.
    /// @param accessManager The address of the `ISMARTTokenAccessManager` contract.
    constructor(address systemAddress, address accessManager) SMARTSystemProxy(systemAddress) {
        if (accessManager == address(0)) revert ZeroAddressNotAllowed();

        ISMARTSystem system_ = _getSystem();
        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data = abi.encodeWithSelector(ISMARTTokenIdentity.initialize.selector, accessManager);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Token Identity module from the `ISMARTSystem` contract.
    /// @dev Reverts with `IdentityImplementationNotSet` if the implementation address is zero.
    /// @param system The `ISMARTSystem` contract instance.
    /// @return The address of the `SMARTTokenIdentityImplementation` contract.
    /// @inheritdoc SMARTSystemProxy
    function _getSpecificImplementationAddress(ISMARTSystem system) internal view override returns (address) {
        address implementation = system.tokenIdentityImplementation(); // Uses the token-specific implementation getter
        if (implementation == address(0)) {
            revert IdentityImplementationNotSet();
        }
        return implementation;
    }
}
