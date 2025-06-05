// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title SMARTTokenSaleProxyTestable
/// @notice Testable proxy for SMARTTokenSale implementations
/// @dev Simple proxy that forwards all calls to the implementation contract
contract SMARTTokenSaleProxyTestable is ERC1967Proxy {
    /// @notice Constructor for the proxy
    /// @param implementation The address of the implementation contract
    /// @param admin The address that will be the admin of the proxy
    /// @param data The initialization data to call on the implementation
    constructor(address implementation, address admin, bytes memory data) ERC1967Proxy(implementation, data) {
        // ERC1967Proxy handles the implementation setting and initialization
        // Admin parameter is for compatibility but not used in this simple proxy
    }
}
