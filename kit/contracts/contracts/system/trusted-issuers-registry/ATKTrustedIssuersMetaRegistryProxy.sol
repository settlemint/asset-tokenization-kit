// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title ATK Trusted Issuers Meta Registry Proxy
/// @author SettleMint
/// @notice Proxy contract for the ATKTrustedIssuersMetaRegistry using ERC1967 proxy pattern
/// @dev This proxy contract delegates all calls to the ATKTrustedIssuersMetaRegistryImplementation
///      contract while maintaining upgradeability and allowing for initialization.
///
///      The proxy uses OpenZeppelin's ERC1967Proxy which provides:
///      - Upgradeable implementation via admin-controlled upgrades
///      - Storage collision resistance via standardized storage slots
///      - Transparent proxy pattern with proper function selector handling
///
///      Initialization is handled by passing the encoded initialize function call
///      to the constructor, which is then delegated to the implementation contract.
contract ATKTrustedIssuersMetaRegistryProxy is ERC1967Proxy {
    /// @notice Constructs the proxy with implementation and initialization data
    /// @dev Deploys the proxy pointing to the specified implementation and calls
    ///      the initialize function with the provided data. The initialize function
    ///      should only be callable once due to the initializer pattern.
    /// @param implementation The address of the ATKTrustedIssuersMetaRegistryImplementation contract
    /// @param _data The ABI-encoded call data for the initialize function, typically:
    ///              abi.encodeWithSelector(
    ///                  ATKTrustedIssuersMetaRegistryImplementation.initialize.selector,
    ///                  accessManager
    ///              )
    constructor(address implementation, bytes memory _data) ERC1967Proxy(implementation, _data) {
        // ERC1967Proxy constructor handles:
        // 1. Setting the implementation address in the standard storage slot
        // 2. Delegating the initialization call to the implementation
        // 3. Setting up the proxy admin (if _data is provided)
    }
}