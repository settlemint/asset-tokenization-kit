// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { Vault } from "../../contracts/v1/Vault.sol"; // Adjust path if needed

// Mock contract to receive calls from the Vault
contract MockTarget is Test {
    uint256 public valueReceived;
    bytes public dataReceived;
    bool public actionTaken;
    address public lastCaller; // Changed name to avoid conflict with vm.caller

    event ActionCalled(address indexed caller, uint256 value, bytes data);
    event ReentrancyAttempt(address indexed caller, uint256 txIndex);

    // Custom Errors
    error ReentrancyGuardIncorrectRevertReason(string reason);
    error MockTargetFailedToSendEth();
    error ReentrancyGuardShouldHaveReverted();
    error ReentrancyGuardShouldHavePreventedCall();

    function performAction(uint256 number) external payable {
        valueReceived = msg.value;
        lastCaller = msg.sender; // This will be the Vault address in direct calls, or Forwarder in meta-tx
        actionTaken = true;
        dataReceived = abi.encode(number); // Store encoded args
        emit ActionCalled(lastCaller, valueReceived, dataReceived);
    }

    // Function to test reentrancy guard in Vault
    function performReentrantAction(Vault _vault, uint256 txIndex) external {
        lastCaller = msg.sender;
        emit ReentrancyAttempt(msg.sender, txIndex);
        // Attempt to call back into a nonReentrant function (e.g., confirm)
        try _vault.confirm(txIndex) {
            revert ReentrancyGuardShouldHavePreventedCall(); // Should not succeed
        } catch Error(string memory reason) {
            // Expected: Revert due to ReentrancyGuard
            if (keccak256(bytes(reason)) != keccak256(bytes("ReentrancyGuard: reentrant call"))) {
                revert ReentrancyGuardIncorrectRevertReason(reason);
            }
        } catch {
            revert ReentrancyGuardShouldHaveReverted(); // Catch any other unexpected revert
        }
    }

    // Function that intentionally fails for testing ExecutionFailed revert
    function failAction() external pure {
        revert("Intentional failure");
    }

    // Allows withdrawing all ETH from this contract.
    function withdrawEth() external {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool sent,) = msg.sender.call{ value: balance }("");
            if (!sent) {
                revert MockTargetFailedToSendEth();
            }
        }
    }
}
