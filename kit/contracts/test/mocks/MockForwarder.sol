// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";

// Mock Forwarder implementing a basic execute pattern for EIP-2771
contract MockForwarder is Test {
    event Forwarded(address indexed target, address indexed sender, uint256 value, bytes data);

    // Minimal execute function mimicking a trusted forwarder
    // It appends the original sender to the calldata
    function execute(
        address target,
        bytes calldata data
    )
        external
        payable
        returns (bool success, bytes memory resultData)
    {
        address sender = msg.sender;
        emit Forwarded(target, sender, msg.value, data);

        // Append sender address (20 bytes) to the end of the data
        bytes memory dataWithSender = abi.encodePacked(data, sender);

        // Forward the call
        (success, resultData) = target.call{ value: msg.value }(dataWithSender);
        // No explicit revert here; let the target call's success/failure propagate
    }

    // Function to get the expected msg.sender when called through this forwarder
    function getExpectedSender(address originalSender) public pure returns (address) {
        return originalSender; // In a real forwarder, this might involve nonces, signatures etc.
    }
}
