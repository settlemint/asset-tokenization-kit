// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKVault } from "../../../contracts/addons/vault/ATKVault.sol";

contract ATKVaultTest is Test {
    ATKVault public vault;
    address public owner;
    address public signer1;
    address public signer2;
    address public signer3;
    address public forwarder;

    function setUp() public {
        owner = makeAddr("owner");
        signer1 = makeAddr("signer1");
        signer2 = makeAddr("signer2");
        signer3 = makeAddr("signer3");
        forwarder = makeAddr("forwarder");

        address[] memory signers = new address[](3);
        signers[0] = signer1;
        signers[1] = signer2;
        signers[2] = signer3;

        vault = new ATKVault(signers, 2, owner, forwarder, address(0));
    }

    function test_InitialState() public view {
        assertEq(vault.required(), 2);
        assertTrue(vault.hasRole(vault.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer1));
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer2));
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer3));
    }

    function test_SubmitTransaction() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(address(0x123), 1 ether, "", "Test transaction");

        assertEq(txIndex, 0);

        ATKVault.Transaction memory txn = vault.transaction(txIndex);
        assertEq(txn.to, address(0x123));
        assertEq(txn.value, 1 ether);
        assertEq(txn.numConfirmations, 1);
        assertFalse(txn.executed);
        assertEq(txn.comment, "Test transaction");
    }

    function test_ConfirmTransaction() public {
        // Submit transaction
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(address(0x123), 0, "", "Test transaction");

        // Confirm by second signer
        vm.prank(signer2);
        vault.confirm(txIndex);

        ATKVault.Transaction memory txn = vault.transaction(txIndex);
        // After execution, confirmations are cleared to save gas
        assertEq(txn.numConfirmations, 0);
        assertTrue(txn.executed); // Should auto-execute with 2 confirmations
    }

    function test_PauseUnpause() public {
        // Only admin can pause
        vm.prank(owner);
        vault.pause();
        assertTrue(vault.paused());

        // Only admin can unpause
        vm.prank(owner);
        vault.unpause();
        assertFalse(vault.paused());
    }

    function test_ReceiveEther() public {
        uint256 amount = 1 ether;
        vm.deal(address(this), amount);

        (bool success,) = address(vault).call{ value: amount }("");
        assertTrue(success);
        assertEq(address(vault).balance, amount);
    }
}
