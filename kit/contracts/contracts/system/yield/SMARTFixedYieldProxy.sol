// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title Proxy for SMARTFixedYieldSchedule
/// @notice This contract is a standard ERC1967Proxy that delegates calls to an implementation
/// of SMARTFixedYieldSchedule. It allows the underlying logic to be upgraded.
/// @dev This proxy is intended to be deployed by SMARTFixedYieldScheduleFactory.
contract SMARTFixedYieldProxy is ERC1967Proxy {
    /// @notice Constructor for the proxy.
    /// @param logic The address of the initial implementation contract.
    /// @param data The data to be passed to the `initialize` function of the implementation contract.
    /// This data should be ABI-encoded.
    constructor(address logic, bytes memory data) ERC1967Proxy(logic, data) {
        // The ERC1967Proxy constructor handles setting the implementation address
        // and calling the initialize function on the implementation contract using the provided data.
    }
}
