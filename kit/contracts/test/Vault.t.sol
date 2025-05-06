// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test, console2 } from "forge-std/Test.sol";
import { Vm } from "forge-std/Vm.sol";
import { Vault } from "../contracts/Vault.sol";
import { MockERC20 } from "./mocks/MockERC20.sol";
import { MockForwarder } from "./mocks/MockForwarder.sol";
import { MockTarget } from "./mocks/MockTarget.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract VaultTest is Test {
    using EnumerableSet for EnumerableSet.AddressSet;

    Vault public vault;
    MockERC20 public token;
    MockForwarder public forwarder;
    MockTarget public targetContract;

    address public admin = makeAddr("admin");
    address public signer1 = makeAddr("signer1");
    address public signer2 = makeAddr("signer2");
    address public signer3 = makeAddr("signer3");
    address public nonSigner = makeAddr("nonSigner");
    address public recipient = makeAddr("recipient");

    address[] public signers;
    uint256 public requiredConfirmations = 2;

    function setUp() public {
        // Deploy Forwarder
        forwarder = new MockForwarder();

        // Prepare signers array
        signers = new address[](3);
        signers[0] = signer1;
        signers[1] = signer2;
        signers[2] = signer3;

        // Deploy Vault
        vm.prank(admin); // Deployer becomes admin
        vault = new Vault(signers, requiredConfirmations, admin, address(forwarder));

        // Deploy Mock ERC20 token and mint some to the vault
        token = new MockERC20("Mock Token", "MOCK", 18);
        token.mint(address(vault), 1_000_000 ether);

        // Deploy Mock Target contract
        targetContract = new MockTarget();

        // Give Vault some ETH
        vm.deal(address(vault), 10 ether);

        // Label addresses for easier debugging
        vm.label(admin, "Admin");
        vm.label(signer1, "Signer 1");
        vm.label(signer2, "Signer 2");
        vm.label(signer3, "Signer 3");
        vm.label(nonSigner, "Non-Signer");
        vm.label(recipient, "Recipient");
        vm.label(address(vault), "Vault");
        vm.label(address(token), "MockERC20");
        vm.label(address(forwarder), "Forwarder");
        vm.label(address(targetContract), "Target Contract");
    }

    // --- Test Deployment ---
    function test_deployment_initialState() public view {
        assertEq(vault.requirement(), requiredConfirmations, "Initial requirement mismatch");
        assertTrue(vault.hasRole(vault.DEFAULT_ADMIN_ROLE(), admin), "Admin role not granted");
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer1), "Signer1 role not granted");
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer2), "Signer2 role not granted");
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer3), "Signer3 role not granted");
        assertFalse(vault.paused(), "Should not be paused initially");
        assertEq(vault.getRoleMemberCount(vault.SIGNER_ROLE()), 3, "Signer count mismatch");
        assertEq(vault.getRoleMemberCount(vault.DEFAULT_ADMIN_ROLE()), 1, "Admin count mismatch");
        assertEq(address(vault).balance, 10 ether, "Initial ETH balance mismatch");
        assertEq(token.balanceOf(address(vault)), 1_000_000 ether, "Initial token balance mismatch");
    }

    function test_RevertIf_Deployment_InvalidRequirement_ZeroSigners() public {
        address[] memory noSigners;
        // The requested requirement is 1, signer count is 0
        vm.expectRevert(abi.encodeWithSelector(Vault.InvalidRequirement.selector, 1, 0));
        vm.prank(admin);
        new Vault(noSigners, 1, admin, address(forwarder));
    }

    function test_RevertIf_Deployment_InvalidRequirement_ZeroRequired() public {
        vm.expectRevert(abi.encodeWithSelector(Vault.InvalidRequirement.selector, 0, 3));
        vm.prank(admin);
        new Vault(signers, 0, admin, address(forwarder));
    }

    function test_RevertIf_Deployment_InvalidRequirement_TooManyRequired() public {
        vm.expectRevert(abi.encodeWithSelector(Vault.InvalidRequirement.selector, 4, 3));
        vm.prank(admin);
        new Vault(signers, 4, admin, address(forwarder));
    }

    // --- Test Roles ---
    function test_grantSignerRole_asAdmin() public {
        vm.startPrank(admin);
        vault.grantRole(vault.SIGNER_ROLE(), nonSigner);
        vm.stopPrank();
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), nonSigner), "Signer role not granted");
    }

    function test_revokeSignerRole_asAdmin() public {
        vm.startPrank(admin);
        vault.revokeRole(vault.SIGNER_ROLE(), signer1);
        vm.stopPrank();
        assertFalse(vault.hasRole(vault.SIGNER_ROLE(), signer1), "Signer role not revoked");
    }

    function test_RevertIf_GrantSignerRole_asNonAdmin() public {
        // Verify nonSigner doesn't have admin role
        assertFalse(vault.hasRole(vault.DEFAULT_ADMIN_ROLE(), nonSigner), "nonSigner should not have admin role");

        // Try to grant the role as non-admin
        vm.startPrank(nonSigner);
        bool reverted = false;
        try vault.grantRole(vault.SIGNER_ROLE(), recipient) {
            // This should not succeed
            assertTrue(false, "Non-admin should not be able to grant roles");
        } catch {
            // Correctly reverted
            reverted = true;
        }
        vm.stopPrank();

        assertTrue(reverted, "Call should have reverted");
        // Verify recipient didn't receive the role
        assertFalse(vault.hasRole(vault.SIGNER_ROLE(), recipient), "Recipient should not have received SIGNER_ROLE");
    }

    function test_RevertIf_RevokeSignerRole_asNonAdmin() public {
        // First, confirm signer1 has the SIGNER_ROLE
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer1), "Signer1 should have SIGNER_ROLE for test setup");
        assertFalse(vault.hasRole(vault.DEFAULT_ADMIN_ROLE(), nonSigner), "nonSigner should not have admin role");

        // Try to revoke the role as non-admin
        vm.startPrank(nonSigner);
        bool reverted = false;
        try vault.revokeRole(vault.SIGNER_ROLE(), signer1) {
            // This should not succeed
            assertTrue(false, "Non-admin should not be able to revoke roles");
        } catch {
            // Correctly reverted
            reverted = true;
        }
        vm.stopPrank();

        assertTrue(reverted, "Call should have reverted");
        // Verify signer1 still has the role
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer1), "Signer1 should still have SIGNER_ROLE");
    }

    // --- Test Requirement Changes ---
    function test_setRequirement_asAdmin() public {
        vm.startPrank(admin);
        vm.expectEmit(true, true, true, true);
        emit Vault.RequirementChanged(admin, 1);
        vault.setRequirement(1);
        assertEq(vault.requirement(), 1, "Requirement not updated");

        vm.expectEmit(true, true, true, true);
        emit Vault.RequirementChanged(admin, 3);
        vault.setRequirement(3);
        assertEq(vault.requirement(), 3, "Requirement not updated");
        vm.stopPrank();
    }

    function test_RevertIf_SetRequirement_asNonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")),
                nonSigner,
                vault.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(nonSigner);
        vault.setRequirement(1);
    }

    function test_RevertIf_SetRequirement_ZeroRequired() public {
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(Vault.InvalidRequirement.selector, 0, 3));
        vault.setRequirement(0);
    }

    function test_RevertIf_SetRequirement_TooManyRequired() public {
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(Vault.InvalidRequirement.selector, 4, 3));
        vault.setRequirement(4);
    }

    // --- Test Pausable ---
    function test_pauseAndUnpause_asAdmin() public {
        vm.prank(admin);
        vault.pause();
        assertTrue(vault.paused(), "Should be paused");

        vm.prank(admin);
        vault.unpause();
        assertFalse(vault.paused(), "Should not be paused");
    }

    function test_RevertIf_Pause_asNonAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")),
                nonSigner,
                vault.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(nonSigner);
        vault.pause();
    }

    function test_RevertIf_Unpause_asNonAdmin() public {
        vm.prank(admin);
        vault.pause(); // First pause
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")),
                nonSigner,
                vault.DEFAULT_ADMIN_ROLE()
            )
        );
        vm.prank(nonSigner);
        vault.unpause();
    }

    function test_RevertIf_SubmitWhenPaused() public {
        vm.prank(admin);
        vault.pause();

        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        vm.prank(signer1);
        vault.submitTransaction(recipient, 1 ether, "", "Paused test");
    }

    function test_RevertIf_ConfirmWhenPaused() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test");

        vm.prank(admin);
        vault.pause();

        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        vm.prank(signer2);
        vault.confirm(txIndex);
    }

    function test_RevokeWhenPaused() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test");

        vm.prank(admin);
        vault.pause();

        // Revoke has whenNotPaused modifier, so it will revert when paused
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        vm.prank(signer1);
        vault.revoke(txIndex);
    }

    // --- Test ETH Deposit ---
    function test_depositETH() public {
        uint256 initialBalance = address(vault).balance;
        uint256 depositAmount = 1 ether;

        // Give recipient enough ETH to make the deposit
        vm.deal(recipient, depositAmount);

        vm.prank(recipient); // Any address can deposit
        vm.expectEmit(true, true, true, true);
        emit Vault.Deposit(recipient, depositAmount, initialBalance + depositAmount);
        (bool success,) = address(vault).call{ value: depositAmount }("");
        assertTrue(success, "ETH deposit failed");

        assertEq(address(vault).balance, initialBalance + depositAmount, "Vault balance mismatch after deposit");
    }

    // --- Test View Functions ---
    function test_view_signers() public view {
        address[] memory currentSigners = vault.signers();
        assertEq(currentSigners.length, 3, "Signer count mismatch");
        assertEq(currentSigners[0], signer1, "Signer 1 mismatch");
        assertEq(currentSigners[1], signer2, "Signer 2 mismatch");
        assertEq(currentSigners[2], signer3, "Signer 3 mismatch");
    }

    function test_view_transaction_nonExistent() public {
        vm.expectRevert(abi.encodeWithSelector(Vault.TxDoesNotExist.selector, 0, 0)); // No transactions yet
        vault.transaction(0);
    }

    function test_view_getConfirmers_nonExistent() public {
        vm.expectRevert(abi.encodeWithSelector(Vault.TxDoesNotExist.selector, 0, 0)); // No transactions yet
        vault.getConfirmers(0);
    }

    // --- Helper Functions ---

    /// @notice Submits and confirms a transaction with the required number of signers.
    /// @param _to Destination address.
    /// @param _value ETH value.
    /// @param _data Call data.
    /// @param _comment Transaction comment.
    /// @return txIndex The index of the submitted transaction.
    function _submitAndConfirmTx(
        address _to,
        uint256 _value,
        bytes memory _data,
        string memory _comment
    )
        internal
        returns (uint256 txIndex)
    {
        // Signer 1 submits
        vm.prank(signer1);
        txIndex = vault.submitTransaction(_to, _value, _data, _comment);

        // Signer 2 confirms (reaching requiredConfirmations = 2)
        vm.prank(signer2);
        vault.confirm(txIndex);
    }

    /// @notice Submits and confirms an ERC20 transfer with the required number of signers.
    function _submitAndConfirmERC20Tx(
        address _token,
        address _to,
        uint256 _amount,
        string memory _comment
    )
        internal
        returns (uint256 txIndex)
    {
        // Signer 1 submits
        vm.prank(signer1);
        txIndex = vault.submitERC20Transfer(_token, _to, _amount, _comment);

        // Signer 2 confirms
        vm.prank(signer2);
        vault.confirm(txIndex);
    }

    /// @notice Submits and confirms a contract call with the required number of signers.
    function _submitAndConfirmContractCallTx(
        address _target,
        uint256 _value,
        bytes4 _selector,
        bytes memory _args,
        string memory _comment
    )
        internal
        returns (uint256 txIndex)
    {
        // Signer 1 submits
        vm.prank(signer1);
        txIndex = vault.submitContractCall(_target, _value, _selector, _args, _comment);

        // Signer 2 confirms
        vm.prank(signer2);
        vault.confirm(txIndex);
    }

    // --- Test Transaction Submission (Standard) ---
    function test_submitTransaction() public {
        vm.startPrank(signer1);
        vm.expectEmit(true, true, true, true);
        // SubmitTransaction(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes
        // data, string comment)
        emit Vault.SubmitTransaction(signer1, 0, recipient, 1 ether, hex"", "Test ETH transfer");
        // ConfirmTransaction(address indexed owner, uint256 indexed txIndex)
        vm.expectEmit(true, true, false, true); // owner, txIndex indexed
        emit Vault.ConfirmTransaction(signer1, 0);

        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test ETH transfer");
        vm.stopPrank();

        assertEq(txIndex, 0, "Incorrect txIndex");
        Vault.Transaction memory txn = vault.transaction(txIndex);
        assertEq(txn.to, recipient, "Txn recipient mismatch");
        assertEq(txn.value, 1 ether, "Txn value mismatch");
        assertEq(txn.data.length, 0, "Txn data mismatch");
        assertEq(txn.comment, "Test ETH transfer", "Txn comment mismatch");
        assertFalse(txn.executed, "Txn should not be executed");
        assertEq(txn.numConfirmations, 1, "Txn should have 1 confirmation");
        assertTrue(vault.confirmations(txIndex, signer1), "Submitter should have confirmed");
    }

    function test_RevertIf_SubmitTransaction_asNonSigner() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), nonSigner, vault.SIGNER_ROLE()
            )
        );
        vm.prank(nonSigner);
        vault.submitTransaction(recipient, 1 ether, "", "Test");
    }

    // --- Test Transaction Submission (ERC20) ---
    function test_submitERC20Transfer() public {
        uint256 amount = 100 ether;
        bytes memory expectedData = abi.encodeWithSelector(token.transfer.selector, recipient, amount);

        vm.startPrank(signer1);
        // SubmitERC20TransferTransaction(address indexed owner, uint256 indexed txIndex, address indexed token, address
        // to, uint256 amount, string comment)
        vm.expectEmit(true, true, true, true);
        emit Vault.SubmitERC20TransferTransaction(signer1, 0, address(token), recipient, amount, "Test ERC20 transfer");
        // ConfirmTransaction(address indexed owner, uint256 indexed txIndex)
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(signer1, 0);

        uint256 txIndex = vault.submitERC20Transfer(address(token), recipient, amount, "Test ERC20 transfer");
        vm.stopPrank();

        assertEq(txIndex, 0, "Incorrect txIndex");
        Vault.Transaction memory txn = vault.transaction(txIndex);
        assertEq(txn.to, address(token), "Txn recipient should be token address");
        assertEq(txn.value, 0, "Txn value should be 0");
        assertEq(txn.data, expectedData, "Txn data mismatch");
        assertEq(txn.comment, "Test ERC20 transfer", "Txn comment mismatch");
        assertFalse(txn.executed, "Txn should not be executed");
        assertEq(txn.numConfirmations, 1, "Txn should have 1 confirmation");
        assertTrue(vault.confirmations(txIndex, signer1), "Submitter should have confirmed");
    }

    function test_RevertIf_SubmitERC20Transfer_asNonSigner() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), nonSigner, vault.SIGNER_ROLE()
            )
        );
        vm.prank(nonSigner);
        vault.submitERC20Transfer(address(token), recipient, 100 ether, "Test");
    }

    // --- Test Transaction Submission (Contract Call) ---
    function test_submitContractCall() public {
        uint256 callValue = 0.5 ether;
        uint256 callArg = 123;
        bytes4 selector = targetContract.performAction.selector;
        bytes memory args = abi.encode(callArg);
        bytes memory expectedData = bytes.concat(selector, args);
        string memory comment = "Test contract call";

        vm.startPrank(signer1);
        // SubmitContractCallTransaction(address indexed owner, uint256 indexed txIndex, address indexed target, uint256
        // value, bytes4 selector, bytes abiEncodedArguments, string comment)
        vm.expectEmit(true, true, true, true);
        emit Vault.SubmitContractCallTransaction(
            signer1, 0, address(targetContract), callValue, selector, args, comment
        );
        // ConfirmTransaction(address indexed owner, uint256 indexed txIndex)
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(signer1, 0);

        uint256 txIndex = vault.submitContractCall(address(targetContract), callValue, selector, args, comment);
        vm.stopPrank();

        assertEq(txIndex, 0, "Incorrect txIndex");
        Vault.Transaction memory txn = vault.transaction(txIndex);
        assertEq(txn.to, address(targetContract), "Txn target mismatch");
        assertEq(txn.value, callValue, "Txn value mismatch");
        assertEq(txn.data, expectedData, "Txn data mismatch");
        assertEq(txn.comment, comment, "Txn comment mismatch");
        assertFalse(txn.executed, "Txn should not be executed");
        assertEq(txn.numConfirmations, 1, "Txn should have 1 confirmation");
        assertTrue(vault.confirmations(txIndex, signer1), "Submitter should have confirmed");
    }

    function test_RevertIf_SubmitContractCall_asNonSigner() public {
        bytes4 selector = targetContract.performAction.selector;
        bytes memory args = abi.encode(123);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), nonSigner, vault.SIGNER_ROLE()
            )
        );
        vm.prank(nonSigner);
        vault.submitContractCall(address(targetContract), 0, selector, args, "Test");
    }

    // --- Test Batch Submission ---
    function test_batchSubmitTransactions() public {
        address[] memory tos = new address[](2);
        tos[0] = recipient;
        tos[1] = address(targetContract);
        uint256[] memory values = new uint256[](2);
        values[0] = 1 ether;
        values[1] = 0;
        bytes[] memory datas = new bytes[](2);
        datas[0] = "";
        datas[1] = abi.encodeWithSelector(targetContract.performAction.selector, 456);
        string[] memory comments = new string[](2);
        comments[0] = "Batch 1";
        comments[1] = "Batch 2";

        vm.startPrank(signer1);
        // Expect events for tx 0
        vm.expectEmit(true, true, true, true);
        emit Vault.SubmitTransaction(signer1, 0, tos[0], values[0], datas[0], comments[0]);
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(signer1, 0);
        // Expect events for tx 1
        vm.expectEmit(true, true, true, true);
        emit Vault.SubmitTransaction(signer1, 1, tos[1], values[1], datas[1], comments[1]);
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(signer1, 1);

        uint256[] memory txIndices = vault.batchSubmitTransactions(tos, values, datas, comments);
        vm.stopPrank();

        assertEq(txIndices.length, 2, "Incorrect number of txIndices");
        assertEq(txIndices[0], 0, "Incorrect txIndex 0");
        assertEq(txIndices[1], 1, "Incorrect txIndex 1");

        // Check tx 0
        Vault.Transaction memory txn0 = vault.transaction(0);
        assertEq(txn0.to, tos[0]);
        assertEq(txn0.numConfirmations, 1);
        assertTrue(vault.confirmations(0, signer1));

        // Check tx 1
        Vault.Transaction memory txn1 = vault.transaction(1);
        assertEq(txn1.to, tos[1]);
        assertEq(txn1.numConfirmations, 1);
        assertTrue(vault.confirmations(1, signer1));
    }

    function test_RevertIf_BatchSubmitTransactions_emptyArray() public {
        address[] memory tos;
        uint256[] memory values;
        bytes[] memory datas;
        string[] memory comments;
        vm.prank(signer1);
        vm.expectRevert(Vault.EmptyBatchArray.selector);
        vault.batchSubmitTransactions(tos, values, datas, comments);
    }

    function test_RevertIf_BatchSubmitTransactions_arrayMismatch() public {
        address[] memory tos = new address[](1);
        uint256[] memory values = new uint256[](2);
        bytes[] memory datas;
        string[] memory comments;
        vm.prank(signer1);
        vm.expectRevert(Vault.ArrayLengthMismatch.selector);
        vault.batchSubmitTransactions(tos, values, datas, comments); // Lengths: 1, 2, 0, 0
    }

    // --- Test Confirmation ---
    function test_confirmTransaction() public {
        // Signer 1 submits
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test Confirm");
        Vault.Transaction memory txn_before = vault.transaction(txIndex);
        assertEq(txn_before.numConfirmations, 1, "Initial confirmations should be 1");

        // Signer 2 confirms
        vm.startPrank(signer2);
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(signer2, txIndex);
        // Expect execution as required confirmations (2) are met
        vm.expectEmit(true, true, false, true);
        emit Vault.ExecuteTransaction(signer2, txIndex);
        vault.confirm(txIndex);
        vm.stopPrank();

        Vault.Transaction memory txn_after = vault.transaction(txIndex);
        assertTrue(txn_after.executed, "Txn should be executed after 2 confirmations");
        assertFalse(vault.confirmations(txIndex, signer2), "Signer 2 confirmation should be cleared after execution");
        assertEq(txn_after.numConfirmations, 0, "Confirmations should be reset after execution");
    }

    function test_RevertIf_ConfirmTransaction_alreadyConfirmed() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test");

        vm.prank(signer1); // Signer 1 tries to confirm again
        vm.expectRevert(abi.encodeWithSelector(Vault.AlreadyConfirmed.selector, txIndex, signer1));
        vault.confirm(txIndex);
    }

    function test_RevertIf_ConfirmTransaction_notSigner() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test");
        // Expect the standard AccessControl error when a non-signer calls
        bytes32 role = vault.SIGNER_ROLE();
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), nonSigner, role
            )
        );
        vm.prank(nonSigner);
        vault.confirm(txIndex);
    }

    function test_RevertIf_ConfirmTransaction_nonExistent() public {
        vm.prank(signer1);
        vm.expectRevert(abi.encodeWithSelector(Vault.TxDoesNotExist.selector, 0, 0)); // No txns yet
        vault.confirm(0);
    }

    function test_RevertIf_ConfirmTransaction_alreadyExecuted() public {
        uint256 txIndex = _submitAndConfirmTx(recipient, 1 ether, "", "Test Executed"); // Submits and confirms to
            // execute

        assertTrue(vault.transaction(txIndex).executed, "Setup: Txn should be executed");

        vm.prank(signer3); // Another signer tries to confirm executed tx
        vm.expectRevert(abi.encodeWithSelector(Vault.TxExecuted.selector, txIndex));
        vault.confirm(txIndex);
    }

    // --- Test Batch Confirmation ---
    function test_batchConfirm() public {
        // Submit two separate transactions
        vm.prank(signer1);
        uint256 txIndex0 = vault.submitTransaction(recipient, 1 ether, "", "BatchConfirm 0");
        vm.prank(signer2);
        uint256 txIndex1 = vault.submitTransaction(
            address(targetContract),
            0,
            abi.encodeWithSelector(targetContract.performAction.selector, 789),
            "BatchConfirm 1"
        );

        assertEq(vault.transaction(txIndex0).numConfirmations, 1);
        assertEq(vault.transaction(txIndex1).numConfirmations, 1);

        uint256[] memory indices = new uint256[](2);
        indices[0] = txIndex0;
        indices[1] = txIndex1;

        // Signer 3 confirms both
        vm.startPrank(signer3);
        // Confirm tx 0
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(signer3, txIndex0);
        // Execute tx 0 (signer1 + signer3 = 2 confirmations)
        vm.expectEmit(true, true, false, true);
        emit Vault.ExecuteTransaction(signer3, txIndex0);
        // Confirm tx 1
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(signer3, txIndex1);
        // Execute tx 1 (signer2 + signer3 = 2 confirmations)
        vm.expectEmit(true, true, false, true);
        emit Vault.ExecuteTransaction(signer3, txIndex1);

        vault.batchConfirm(indices);
        vm.stopPrank();

        assertTrue(vault.transaction(txIndex0).executed, "Tx 0 should be executed");
        assertTrue(vault.transaction(txIndex1).executed, "Tx 1 should be executed");
    }

    function test_RevertIf_BatchConfirm_emptyArray() public {
        uint256[] memory indices;
        vm.prank(signer1);
        vm.expectRevert(Vault.EmptyBatchArray.selector);
        vault.batchConfirm(indices);
    }

    // --- Test Revocation ---
    function test_revokeConfirmation() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test Revoke");
        assertEq(vault.transaction(txIndex).numConfirmations, 1, "Confirmations before revoke");
        assertTrue(vault.confirmations(txIndex, signer1), "Signer1 confirmed before revoke");

        vm.startPrank(signer1);
        vm.expectEmit(true, true, false, true);
        emit Vault.RevokeConfirmation(signer1, txIndex);
        vault.revoke(txIndex);
        vm.stopPrank();

        Vault.Transaction memory txn_after = vault.transaction(txIndex);
        assertEq(txn_after.numConfirmations, 0, "Confirmations after revoke");
        assertFalse(vault.confirmations(txIndex, signer1), "Signer1 not confirmed after revoke");
        assertFalse(txn_after.executed, "Txn should not be executed");
    }

    function test_RevertIf_RevokeConfirmation_notConfirmed() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test");

        vm.prank(signer2); // Signer 2 didn't confirm
        vm.expectRevert(abi.encodeWithSelector(Vault.NotConfirmed.selector, txIndex, signer2));
        vault.revoke(txIndex);
    }

    function test_RevertIf_RevokeConfirmation_notSigner() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Test");
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), nonSigner, vault.SIGNER_ROLE()
            )
        );
        vm.prank(nonSigner);
        vault.revoke(txIndex);
    }

    function test_RevertIf_RevokeConfirmation_nonExistent() public {
        vm.prank(signer1);
        vm.expectRevert(abi.encodeWithSelector(Vault.TxDoesNotExist.selector, 0, 0));
        vault.revoke(0);
    }

    function test_RevertIf_RevokeConfirmation_alreadyExecuted() public {
        uint256 txIndex = _submitAndConfirmTx(recipient, 1 ether, "", "Test Executed Revoke"); // Submits and confirms
            // to execute

        assertTrue(vault.transaction(txIndex).executed, "Setup: Txn should be executed");

        vm.prank(signer1); // Submitter tries to revoke executed tx
        vm.expectRevert(abi.encodeWithSelector(Vault.TxExecuted.selector, txIndex));
        vault.revoke(txIndex);
    }

    // --- Test Execution ---
    function test_executeTransaction_ETHTransfer() public {
        uint256 transferAmount = 1 ether;
        uint256 initialVaultBalance = address(vault).balance;
        uint256 initialRecipientBalance = recipient.balance;

        // Signer 1 submits, Signer 2 confirms (triggers execution)
        vm.startPrank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, transferAmount, "", "Test ETH Exec");
        vm.stopPrank();

        vm.startPrank(signer2);
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(signer2, txIndex);
        vm.expectEmit(true, true, false, true);
        emit Vault.ExecuteTransaction(signer2, txIndex);
        vault.confirm(txIndex);
        vm.stopPrank();

        assertTrue(vault.transaction(txIndex).executed, "Txn should be executed");
        assertEq(address(vault).balance, initialVaultBalance - transferAmount, "Vault balance incorrect after ETH exec");
        assertEq(
            recipient.balance, initialRecipientBalance + transferAmount, "Recipient balance incorrect after ETH exec"
        );
        assertEq(vault.transaction(txIndex).numConfirmations, 0, "Confirmations should be 0 after exec");
        assertFalse(vault.confirmations(txIndex, signer1), "Signer 1 confirm flag not cleared");
        assertFalse(vault.confirmations(txIndex, signer2), "Signer 2 confirm flag not cleared");

        // Check confirmers list is empty
        address[] memory confirmers = vault.getConfirmers(txIndex);
        assertEq(confirmers.length, 0, "Confirmers list should be empty after execution");
    }

    function test_executeTransaction_ERC20Transfer() public {
        uint256 transferAmount = 50 ether;
        uint256 initialVaultTokenBalance = token.balanceOf(address(vault));
        uint256 initialRecipientTokenBalance = token.balanceOf(recipient);

        // Signer 1 submits, Signer 2 confirms (triggers execution)
        uint256 txIndex = _submitAndConfirmERC20Tx(address(token), recipient, transferAmount, "Test ERC20 Exec");

        assertTrue(vault.transaction(txIndex).executed, "Txn should be executed");
        assertEq(
            token.balanceOf(address(vault)), initialVaultTokenBalance - transferAmount, "Vault token balance incorrect"
        );
        assertEq(
            token.balanceOf(recipient),
            initialRecipientTokenBalance + transferAmount,
            "Recipient token balance incorrect"
        );
    }

    function test_executeTransaction_ContractCall() public {
        uint256 callValue = 0.1 ether;
        uint256 callArg = 999;
        bytes4 selector = targetContract.performAction.selector;
        bytes memory args = abi.encode(callArg);
        uint256 initialVaultBalance = address(vault).balance;
        uint256 initialTargetBalance = address(targetContract).balance;
        bytes memory expectedData = abi.encode(callArg);

        // Signer 1 submits, Signer 2 confirms (triggers execution)
        uint256 txIndex =
            _submitAndConfirmContractCallTx(address(targetContract), callValue, selector, args, "Test Call Exec");

        assertTrue(vault.transaction(txIndex).executed, "Txn should be executed");
        assertEq(address(vault).balance, initialVaultBalance - callValue, "Vault balance incorrect after call exec");
        assertEq(
            address(targetContract).balance,
            initialTargetBalance + callValue,
            "Target balance incorrect after call exec"
        );
        assertTrue(targetContract.actionTaken(), "Target action not taken");
        assertEq(targetContract.valueReceived(), callValue, "Target value received mismatch");
        assertEq(targetContract.dataReceived(), expectedData, "Target data received mismatch");
        // The caller *inside* the target contract will be the Vault itself
        assertEq(targetContract.lastCaller(), address(vault), "Target caller mismatch");
    }

    function test_RevertIf_ExecuteTransaction_callFails() public {
        // Target function doesn't exist
        bytes memory badData = abi.encodeWithSignature("nonExistentFunction()");

        // Signer 1 submits
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(address(targetContract), 0, badData, "Test Fail Exec");

        // Signer 2 confirms, expecting the confirm call itself to revert because execution fails
        vm.startPrank(signer2);
        vm.expectEmit(true, true, false, true); // Confirm event still emitted before execution attempt
        emit Vault.ConfirmTransaction(signer2, txIndex);

        // Expect the confirm() call to revert with ExecutionFailed
        vm.expectRevert(
            abi.encodeWithSelector(Vault.ExecutionFailed.selector, txIndex, address(targetContract), badData)
        );
        vault.confirm(txIndex);
        vm.stopPrank();

        // Verify state: Transaction should NOT be executed, and signer2's confirmation was rolled back
        Vault.Transaction memory txn = vault.transaction(txIndex);
        assertFalse(txn.executed, "Txn should not be marked executed on failure");
        assertEq(txn.numConfirmations, 1, "Confirmations should be 1 (only signer1's)");
        assertTrue(vault.confirmations(txIndex, signer1), "Signer 1 confirmation should persist");
        assertFalse(vault.confirmations(txIndex, signer2), "Signer 2 confirmation should have been rolled back");
    }

    // --- Test View Functions (Post-Tx) ---
    function test_view_transaction_valid() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "View Test");
        Vault.Transaction memory txn = vault.transaction(txIndex);

        assertEq(txn.to, recipient);
        assertEq(txn.value, 1 ether);
        assertEq(txn.comment, "View Test");
        assertFalse(txn.executed);
        assertEq(txn.numConfirmations, 1);
    }

    function test_view_hasConfirmed() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Confirm View Test");
        assertTrue(vault.hasConfirmed(txIndex, signer1), "Submitter should have confirmed");
        assertFalse(vault.hasConfirmed(txIndex, signer2), "Signer 2 should not have confirmed yet");

        vm.prank(signer2);
        vault.confirm(txIndex); // Executes
        assertFalse(vault.hasConfirmed(txIndex, signer1), "Signer 1 confirm should be false after exec");
        assertFalse(vault.hasConfirmed(txIndex, signer2), "Signer 2 confirm should be false after exec");
    }

    function test_view_getConfirmers() public {
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Confirmers View Test");

        address[] memory confirmers1 = vault.getConfirmers(txIndex);
        assertEq(confirmers1.length, 1, "Should have 1 confirmer initially");
        assertEq(confirmers1[0], signer1, "Initial confirmer mismatch");

        vm.prank(signer3); // Use a different signer
        vault.confirm(txIndex);

        address[] memory confirmers2 = vault.getConfirmers(txIndex);
        assertTrue(vault.transaction(txIndex).executed, "Tx should be executed now");
        assertEq(confirmers2.length, 0, "Confirmers should be empty after execution");

        // Check non-existent again
        vm.expectRevert(abi.encodeWithSelector(Vault.TxDoesNotExist.selector, 1, 0));
        vault.getConfirmers(1);
    }

    // --- Test Reentrancy Guard ---

    function test_RevertIf_Reentrancy_onConfirm() public {
        // Setup: Submit a transaction that calls back into the vault
        bytes memory reentrantData = abi.encodeWithSelector(targetContract.performReentrantAction.selector, vault, 0); // txIndex
            // 0
        vm.prank(signer1);
        uint256 txIndex = vault.submitContractCall(
            address(targetContract),
            0,
            targetContract.performReentrantAction.selector,
            abi.encode(vault, 0),
            "Reentrancy Test"
        );
        assertEq(txIndex, 0, "txIndex mismatch");

        // Trigger: Signer 2 confirms, which executes the call to MockTarget.performReentrantAction
        // MockTarget then tries to call vault.confirm(0) again.
        vm.startPrank(signer2);
        vm.expectEmit(true, true, false, true); // Confirm event for signer 2 emitted before execution attempt
        emit Vault.ConfirmTransaction(signer2, txIndex);

        // Expect the event from MockTarget *before* the revert
        vm.expectEmit(true, false, false, true);
        emit MockTarget.ReentrancyAttempt(address(vault), txIndex);

        // Expect the confirm() call to revert with ExecutionFailed because the target call failed (due to reentrancy
        // guard on Vault.confirm)
        vm.expectRevert(
            abi.encodeWithSelector(Vault.ExecutionFailed.selector, txIndex, address(targetContract), reentrantData)
        );
        vault.confirm(txIndex);
        vm.stopPrank();

        // Check state: Transaction should NOT be executed, and signer2's confirmation was rolled back
        Vault.Transaction memory txn = vault.transaction(txIndex);
        assertFalse(txn.executed, "Transaction should not be executed after failed reentrant call");
        assertEq(txn.numConfirmations, 1, "Confirmations should be 1 (only signer1's)");
        assertTrue(vault.confirmations(txIndex, signer1), "Signer 1 confirmation should persist");
        assertFalse(vault.confirmations(txIndex, signer2), "Signer 2 confirmation should have been rolled back");
    }

    function test_RevertIf_Reentrancy_onBatchConfirm() public {
        // Setup: Submit two txns. Tx 1 calls back into the vault.
        vm.prank(signer1);
        uint256 txIndex0 = vault.submitTransaction(recipient, 0, "", "Batch Reentrancy 0");
        bytes memory reentrantData = abi.encodeWithSelector(targetContract.performReentrantAction.selector, vault, 1); // txIndex
            // 1
        vm.prank(signer2); // Submitted by a different signer
        uint256 txIndex1 = vault.submitContractCall(
            address(targetContract),
            0,
            targetContract.performReentrantAction.selector,
            abi.encode(vault, 1),
            "Batch Reentrancy 1"
        );

        uint256[] memory indices = new uint256[](2);
        indices[0] = txIndex0;
        indices[1] = txIndex1;

        // Trigger: Signer 3 batch confirms.
        // Confirming txIndex0 succeeds and executes.
        // Confirming txIndex1 triggers the reentrant call, causing execution failure and reverting the batchConfirm
        // call.
        vm.startPrank(signer3);
        vm.expectEmit(true, true, false, true); // Confirm tx 0
        emit Vault.ConfirmTransaction(signer3, txIndex0);
        vm.expectEmit(true, true, false, true); // Execute tx 0 (signer1 + signer3)
        emit Vault.ExecuteTransaction(signer3, txIndex0);

        vm.expectEmit(true, true, false, true); // Confirm tx 1 (emitted before execution attempt)
        emit Vault.ConfirmTransaction(signer3, txIndex1);

        // Expect the event from MockTarget *before* the revert
        vm.expectEmit(true, false, false, true);
        emit MockTarget.ReentrancyAttempt(address(vault), txIndex1);

        // Expect the batchConfirm() call to revert with ExecutionFailed when processing txIndex1
        vm.expectRevert(
            abi.encodeWithSelector(Vault.ExecutionFailed.selector, txIndex1, address(targetContract), reentrantData)
        );
        vault.batchConfirm(indices);
        vm.stopPrank();

        // Check state: The entire batchConfirm reverted. Tx 0 was NOT executed, and Signer 3's confirmations were
        // rolled back.
        assertFalse(vault.transaction(txIndex0).executed, "Tx 0 should NOT be executed due to batch revert");
        assertFalse(vault.transaction(txIndex1).executed, "Tx 1 should not be executed");

        // Check original confirmations are still present
        assertEq(vault.transaction(txIndex0).numConfirmations, 1, "Tx 0 Confirmations should be 1 (only signer1's)");
        assertTrue(vault.confirmations(txIndex0, signer1), "Signer 1 confirmation for Tx 0 should persist");
        assertEq(vault.transaction(txIndex1).numConfirmations, 1, "Tx 1 Confirmations should be 1 (only signer2's)");
        assertTrue(vault.confirmations(txIndex1, signer2), "Signer 2 confirmation for Tx 1 should persist");

        // Check Signer 3's confirmations were rolled back for both
        assertFalse(vault.confirmations(txIndex0, signer3), "Signer 3 confirmation for Tx 0 should be rolled back");
        assertFalse(vault.confirmations(txIndex1, signer3), "Signer 3 confirmation for Tx 1 should be rolled back");
    }

    // Add similar tests for reentrancy on submitTransaction, batchSubmit*, etc. if necessary,
    // although confirm/execute is the most critical path for reentrancy.

    // --- Test ERC2771 Meta Transactions (Forwarder) ---

    function test_metaTx_submitTransaction() public {
        address sender = signer1; // The EOA initiating the meta-tx
        uint256 value = 1 ether;
        string memory comment = "Meta-Tx Submit";

        // Encode the actual Vault.submitTransaction call data
        bytes memory vaultCallData =
            abi.encodeWithSelector(vault.submitTransaction.selector, recipient, value, "", comment);

        // User (signer1) calls execute on the Forwarder
        vm.startPrank(sender);

        // Expect event from Forwarder first
        vm.expectEmit(true, true, false, true); // target, sender indexed
        emit MockForwarder.Forwarded(address(vault), sender, 0, vaultCallData);

        // Then expect events from the Vault, with sender as the owner/confirmer
        vm.expectEmit(true, true, true, true);
        emit Vault.SubmitTransaction(sender, 0, recipient, value, hex"", comment);
        vm.expectEmit(true, true, false, true);
        emit Vault.ConfirmTransaction(sender, 0);

        (bool success, bytes memory resultData) = forwarder.execute(address(vault), vaultCallData);
        assertTrue(success, "Forwarder execution failed");

        // Decode the txIndex returned from Vault.submitTransaction via the forwarder
        uint256 txIndex = abi.decode(resultData, (uint256));
        vm.stopPrank();

        // Verify state in Vault
        assertEq(txIndex, 0, "Incorrect txIndex from meta-tx");
        Vault.Transaction memory txn = vault.transaction(txIndex);
        assertEq(txn.to, recipient);
        assertEq(txn.value, value);
        assertEq(txn.numConfirmations, 1, "Confirmations mismatch");
        assertTrue(vault.confirmations(txIndex, sender), "Meta-tx sender should have confirmed");
    }

    function test_metaTx_confirmTransaction() public {
        // Signer 1 submits normally
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Meta-Tx Confirm Test");

        address sender = signer2; // Signer 2 confirms via meta-tx

        // Encode the Vault.confirm call data
        bytes memory vaultCallData = abi.encodeWithSelector(vault.confirm.selector, txIndex);

        // Signer 2 calls execute on the Forwarder
        vm.startPrank(sender);

        // Expect event from Forwarder first
        vm.expectEmit(true, true, false, true);
        emit MockForwarder.Forwarded(address(vault), sender, 0, vaultCallData);

        // Then expect events from the Vault
        vm.expectEmit(true, true, false, true); // Confirm event for signer 2
        emit Vault.ConfirmTransaction(sender, txIndex);
        vm.expectEmit(true, true, false, true); // Execute event triggered by signer 2
        emit Vault.ExecuteTransaction(sender, txIndex);

        (bool success,) = forwarder.execute(address(vault), vaultCallData);
        assertTrue(success, "Forwarder execution failed");
        vm.stopPrank();

        // Verify state
        assertTrue(vault.transaction(txIndex).executed, "Tx should be executed via meta-tx confirm");
        assertEq(vault.transaction(txIndex).numConfirmations, 0, "Confirmations should be 0 after meta-tx exec");
    }

    function test_metaTx_revokeConfirmation() public {
        // Signer 1 submits normally
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Meta-Tx Revoke Test");

        address sender = signer1; // Signer 1 revokes via meta-tx

        // Encode the Vault.revoke call data
        bytes memory vaultCallData = abi.encodeWithSelector(vault.revoke.selector, txIndex);

        // Signer 1 calls execute on the Forwarder
        vm.startPrank(sender);

        // Expect event from Forwarder first
        vm.expectEmit(true, true, false, true);
        emit MockForwarder.Forwarded(address(vault), sender, 0, vaultCallData);

        // Then expect event from the Vault
        vm.expectEmit(true, true, false, true); // Revoke event for signer 1
        emit Vault.RevokeConfirmation(sender, txIndex);

        (bool success,) = forwarder.execute(address(vault), vaultCallData);
        assertTrue(success, "Forwarder execution failed");
        vm.stopPrank();

        // Verify state
        assertFalse(vault.confirmations(txIndex, sender), "Confirmation should be revoked via meta-tx");
        assertEq(vault.transaction(txIndex).numConfirmations, 0, "Confirmations should be 0 after meta-tx revoke");
    }

    function test_RevertIf_MetaTx_fromNonSigner_confirm() public {
        // Signer 1 submits normally
        vm.prank(signer1);
        uint256 txIndex = vault.submitTransaction(recipient, 1 ether, "", "Fail Meta-Tx Confirm");

        // Verify initial state
        Vault.Transaction memory txnBefore = vault.transaction(txIndex);
        assertEq(txnBefore.numConfirmations, 1, "Should start with 1 confirmation");
        assertTrue(vault.hasConfirmed(txIndex, signer1), "signer1 should have confirmed");

        address sender = nonSigner; // Non-signer tries to confirm via meta-tx
        assertFalse(vault.hasRole(vault.SIGNER_ROLE(), sender), "nonSigner should not have SIGNER_ROLE");

        // Encode the Vault.confirm call data
        bytes memory vaultCallData = abi.encodeWithSelector(vault.confirm.selector, txIndex);

        // Non-signer calls execute on the Forwarder
        vm.prank(sender);
        (bool success,) =
            address(forwarder).call(abi.encodeWithSelector(forwarder.execute.selector, address(vault), vaultCallData));

        // The forwarder call may succeed, but the confirm function should have no effect
        // when called by a non-signer through the forwarder

        // Check post-execution state
        Vault.Transaction memory txnAfter = vault.transaction(txIndex);
        assertEq(txnAfter.numConfirmations, txnBefore.numConfirmations, "Confirmation count should not change");
        assertFalse(txnAfter.executed, "Transaction should not be executed");
        assertTrue(vault.hasConfirmed(txIndex, signer1), "signer1 should still have confirmed");
        assertFalse(vault.hasConfirmed(txIndex, sender), "nonSigner should not have confirmed");
    }
}
