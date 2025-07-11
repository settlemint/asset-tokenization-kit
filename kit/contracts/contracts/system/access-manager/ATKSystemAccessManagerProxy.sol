// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin imports
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title Proxy for ATK System Access Manager
/// @notice This contract serves as a transparent proxy for the ATKSystemAccessManagerImplementation
/// @dev Uses OpenZeppelin's ERC1967Proxy pattern to enable upgradeable system access management
///      The proxy delegates all calls to the implementation contract while maintaining state
contract ATKSystemAccessManagerProxy is ERC1967Proxy {
    /// @notice Constructor for the ATKSystemAccessManagerProxy
    /// @dev Initializes the proxy with the implementation address and initialization data
    /// @param implementation The address of the ATKSystemAccessManagerImplementation contract
    /// @param data The initialization data to call on the implementation (encoded initialize function call)
    constructor(address implementation, bytes memory data) ERC1967Proxy(implementation, data) {
        // The ERC1967Proxy constructor handles:
        // 1. Setting the implementation address in storage
        // 2. Calling the implementation with the provided data (if any)
        // 3. Emitting the appropriate events
    }
}
