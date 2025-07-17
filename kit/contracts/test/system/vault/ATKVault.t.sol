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

        address[] memory initialAdmins = new address[](2);
        initialAdmins[0] = owner;

        vault = new ATKVault(signers, 2, forwarder, address(0), initialAdmins);

        vm.prank(owner);
        vault.grantRole(vault.GOVERNANCE_ROLE(), owner);
        vm.prank(owner);
        vault.grantRole(vault.EMERGENCY_ROLE(), owner);
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

    function test_SetOnchainId() public {
        address mockOnchainId = makeAddr("onchainId");

        // Initially no onchainId set
        assertEq(vault.onchainID(), address(0));

        // Only governance role can set onchainId
        vm.prank(owner);
        vault.setOnchainId(mockOnchainId);

        assertEq(vault.onchainID(), mockOnchainId);
    }

    function test_SetOnchainId_RevertWhenCalledByNonGovernance() public {
        address mockOnchainId = makeAddr("onchainId");

        vm.prank(signer1);
        vm.expectRevert();
        vault.setOnchainId(mockOnchainId);
    }

    function test_SetOnchainId_RevertWhenAlreadySet() public {
        address mockOnchainId1 = makeAddr("onchainId1");
        address mockOnchainId2 = makeAddr("onchainId2");

        // Set first time
        vm.prank(owner);
        vault.setOnchainId(mockOnchainId1);

        // Try to set again - should revert
        vm.prank(owner);
        vm.expectRevert(ATKVault.OnchainIdAlreadySet.selector);
        vault.setOnchainId(mockOnchainId2);
    }

    function test_SetOnchainId_RevertWhenAddressZero() public {
        vm.prank(owner);
        vm.expectRevert(ATKVault.InvalidOnchainId.selector);
        vault.setOnchainId(address(0));
    }

    function test_OnchainIdPermissions() public {
        address mockOnchainId = makeAddr("onchainId");

        vm.prank(owner);
        vault.setOnchainId(mockOnchainId);

        // Owner (governance role) can add/remove claims
        assertTrue(vault.canAddClaim(owner));
        assertTrue(vault.canRemoveClaim(owner));

        // Signers cannot add/remove claims
        assertFalse(vault.canAddClaim(signer1));
        assertFalse(vault.canRemoveClaim(signer1));
    }
}
