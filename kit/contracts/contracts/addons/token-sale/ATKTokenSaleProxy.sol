// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

/// @title ATKTokenSaleProxy
/// @author SettleMint
/// @notice Proxy contract for ATKTokenSale implementations
/// @dev This is a lightweight proxy that delegates calls to an implementation contract
contract ATKTokenSaleProxy is TransparentUpgradeableProxy {
    /// @notice Constructor for creating a new ATKTokenSaleProxy
    /// @param _logic The address of the initial implementation of the proxy
    /// @param _admin The address of the admin of the proxy
    /// @param _data Data to pass to the implementation for initialization function call, or empty bytes if no call
    constructor(
        address _logic,
        address _admin,
        bytes memory _data
    )
        payable
        TransparentUpgradeableProxy(_logic, _admin, _data)
    { }
}
