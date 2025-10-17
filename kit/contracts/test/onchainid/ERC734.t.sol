// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ERC734 } from "../../contracts/onchainid/extensions/ERC734.sol";
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { ERC734KeyPurposes } from "../../contracts/onchainid/ERC734KeyPurposes.sol";
import { ERC734KeyTypes } from "../../contracts/onchainid/ERC734KeyTypes.sol";

contract MockERC734 is ERC734 {
    constructor(address initialManagementKey) ERC734(initialManagementKey, false) { }

    // Override to make functions public for testing
    function addKey(bytes32 _key, uint256 _purpose, uint256 _keyType) public override returns (bool success) {
        return super.addKey(_key, _purpose, _keyType);
    }

    function removeKey(bytes32 _key, uint256 _purpose) public override returns (bool success) {
        return super.removeKey(_key, _purpose);
    }

    function approve(uint256 _id, bool _approve) public override returns (bool success) {
        return super.approve(_id, _approve);
    }

    function execute(address _to, uint256 _value, bytes calldata _data)
        public
        payable
        override
        returns (uint256 executionId)
    {
        return super.execute(_to, _value, _data);
    }
}

contract TargetContract {
    uint256 public value;
    bool public called;

    function setValue(uint256 _value) external {
        value = _value;
        called = true;
    }

    function revertFunction() external pure {
        revert("Intentional revert");
    }

    receive() external payable { }
}

contract ERC734Test is Test {
    MockERC734 public erc734;
    TargetContract public target;

    uint256 internal initialManagementKeyPrivateKey = 0x12345;
    address internal initialManagementKey;

    bytes32 public constant TEST_KEY_1 = keccak256("test_key_1");
    bytes32 public constant TEST_KEY_2 = keccak256("test_key_2");
    bytes32 public constant MANAGEMENT_KEY = keccak256("management_key");
    bytes32 public constant ACTION_KEY = keccak256("action_key");

    function setUp() public {
        initialManagementKey = vm.addr(initialManagementKeyPrivateKey);
        erc734 = new MockERC734(initialManagementKey);
        target = new TargetContract();

        // Fund the test contract
        vm.deal(address(this), 10 ether);
        vm.deal(address(erc734), 5 ether);
    }

    function test_ConstructorInitialization() public {
        // Verify initial state after deployment
        MockERC734 newContract = new MockERC734(initialManagementKey);

        // Check that no keys exist initially
        bytes32[] memory managementKeys = newContract.getKeysByPurpose(ERC734KeyPurposes.MANAGEMENT_KEY);
        assertEq(managementKeys.length, 1);

        bytes32[] memory actionKeys = newContract.getKeysByPurpose(ERC734KeyPurposes.ACTION_KEY);
        assertEq(actionKeys.length, 0);

        bytes32[] memory claimSignerKeys = newContract.getKeysByPurpose(ERC734KeyPurposes.CLAIM_SIGNER_KEY);
        assertEq(claimSignerKeys.length, 0);

        bytes32[] memory encryptionKeys = newContract.getKeysByPurpose(ERC734KeyPurposes.ENCRYPTION_KEY);
        assertEq(encryptionKeys.length, 0);

        // Check that test keys don't have any purposes
        assertTrue(
            newContract.keyHasPurpose(keccak256(abi.encode(initialManagementKey)), ERC734KeyPurposes.MANAGEMENT_KEY)
        );
        assertFalse(newContract.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY));
        assertFalse(newContract.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY));
        assertFalse(newContract.keyHasPurpose(TEST_KEY_2, ERC734KeyPurposes.MANAGEMENT_KEY));

        // Check that getting a non-existent key returns empty data
        (uint256[] memory purposes, uint256 keyType, bytes32 key) = newContract.getKey(TEST_KEY_1);
        assertEq(purposes.length, 0);
        assertEq(keyType, 0);
        assertEq(key, bytes32(0));

        // Check that getting purposes for a non-existent key returns empty array
        uint256[] memory keyPurposes = newContract.getKeyPurposes(TEST_KEY_1);
        assertEq(keyPurposes.length, 0);
    }

    function test_AddKey() public {
        vm.expectEmit(true, true, true, true);
        emit IERC734.KeyAdded(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);

        bool success = erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);
        assertTrue(success);

        // Verify key was added
        (uint256[] memory purposes, uint256 keyType, bytes32 key) = erc734.getKey(TEST_KEY_1);
        assertEq(purposes.length, 1);
        assertEq(purposes[0], ERC734KeyPurposes.MANAGEMENT_KEY);
        assertEq(keyType, ERC734KeyTypes.ECDSA);
        assertEq(key, TEST_KEY_1);

        // Verify keyHasPurpose - management keys have access to all purposes
        assertTrue(erc734.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY));
        assertTrue(erc734.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY)); // Management keys can do everything
    }

    function test_AddMultiplePurposesToSameKey() public {
        // Add first purpose
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);

        // Add second purpose to same key
        vm.expectEmit(true, true, true, true);
        emit IERC734.KeyAdded(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY, ERC734KeyTypes.ECDSA);

        bool success = erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY, ERC734KeyTypes.ECDSA);
        assertTrue(success);

        // Verify both purposes exist
        (uint256[] memory purposes,,) = erc734.getKey(TEST_KEY_1);
        assertEq(purposes.length, 2);
        assertTrue(erc734.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY));
        assertTrue(erc734.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY));
    }

    function test_AddKey_ZeroKey() public {
        vm.expectRevert(ERC734.KeyCannotBeZero.selector);
        erc734.addKey(bytes32(0), ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);
    }

    function test_AddKey_DuplicatePurpose() public {
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);

        vm.expectRevert(
            abi.encodeWithSelector(
                ERC734.KeyAlreadyHasThisPurpose.selector, TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY
            )
        );
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);
    }

    function test_RemoveKey() public {
        // Add key with multiple purposes
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY, ERC734KeyTypes.ECDSA);

        // Remove one purpose
        vm.expectEmit(true, true, true, true);
        emit IERC734.KeyRemoved(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);

        bool success = erc734.removeKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY);
        assertTrue(success);

        // Verify purpose was removed but key still exists
        assertFalse(erc734.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY));
        assertTrue(erc734.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY));

        // Remove last purpose
        erc734.removeKey(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY);

        // Verify key is completely removed
        (uint256[] memory purposes,,) = erc734.getKey(TEST_KEY_1);
        assertEq(purposes.length, 0);
    }

    function test_RemoveKey_NonexistentKey() public {
        vm.expectRevert(abi.encodeWithSelector(ERC734.KeyDoesNotExist.selector, TEST_KEY_1));
        erc734.removeKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY);
    }

    function test_RemoveKey_NonexistentPurpose() public {
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);

        vm.expectRevert(
            abi.encodeWithSelector(ERC734.KeyDoesNotHaveThisPurpose.selector, TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY)
        );
        erc734.removeKey(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY);
    }

    function test_GetKeysByPurpose() public {
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);
        erc734.addKey(TEST_KEY_2, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.RSA);
        erc734.addKey(ACTION_KEY, ERC734KeyPurposes.ACTION_KEY, ERC734KeyTypes.ECDSA);

        bytes32[] memory managementKeys = erc734.getKeysByPurpose(ERC734KeyPurposes.MANAGEMENT_KEY);
        assertEq(managementKeys.length, 3);

        // Order might vary, so check both keys are present
        assertTrue(
            (managementKeys[0] == TEST_KEY_1
                    && managementKeys[1] == TEST_KEY_2
                    && managementKeys[2] == keccak256(abi.encode(initialManagementKey)))
                || (managementKeys[0] == TEST_KEY_2
                    && managementKeys[1] == TEST_KEY_1
                    && managementKeys[2] == keccak256(abi.encode(initialManagementKey)))
                || (managementKeys[0] == keccak256(abi.encode(initialManagementKey))
                    && managementKeys[1] == TEST_KEY_1
                    && managementKeys[2] == TEST_KEY_2)
        );

        bytes32[] memory actionKeys = erc734.getKeysByPurpose(ERC734KeyPurposes.ACTION_KEY);
        assertEq(actionKeys.length, 1);
        assertEq(actionKeys[0], ACTION_KEY);
    }

    function test_GetKeyPurposes() public {
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.ACTION_KEY, ERC734KeyTypes.ECDSA);
        erc734.addKey(TEST_KEY_1, ERC734KeyPurposes.CLAIM_SIGNER_KEY, ERC734KeyTypes.ECDSA);

        uint256[] memory purposes = erc734.getKeyPurposes(TEST_KEY_1);
        assertEq(purposes.length, 3);

        // Check all purposes are present (order might vary)
        bool hasManagement = false;
        bool hasAction = false;
        bool hasClaimSigner = false;

        for (uint256 i = 0; i < purposes.length; i++) {
            if (purposes[i] == ERC734KeyPurposes.MANAGEMENT_KEY) hasManagement = true;
            if (purposes[i] == ERC734KeyPurposes.ACTION_KEY) hasAction = true;
            if (purposes[i] == ERC734KeyPurposes.CLAIM_SIGNER_KEY) hasClaimSigner = true;
        }

        assertTrue(hasManagement);
        assertTrue(hasAction);
        assertTrue(hasClaimSigner);
    }

    function test_Execute() public {
        bytes memory data = abi.encodeWithSelector(TargetContract.setValue.selector, 42);

        vm.expectEmit(true, true, true, true);
        emit IERC734.ExecutionRequested(0, address(target), 0, data);

        uint256 executionId = erc734.execute(address(target), 0, data);
        assertEq(executionId, 0);

        // Verify execution was created but not executed
        assertFalse(target.called());
        assertEq(target.value(), 0);
    }

    function test_Execute_ZeroAddress() public {
        vm.expectRevert(ERC734.CannotExecuteToZeroAddress.selector);
        erc734.execute(address(0), 0, "");
    }

    function test_Approve() public {
        // First create an execution
        bytes memory data = abi.encodeWithSelector(TargetContract.setValue.selector, 42);
        uint256 executionId = erc734.execute(address(target), 0, data);

        // Approve and execute
        vm.expectEmit(true, true, false, false);
        emit IERC734.Approved(executionId, true);

        vm.expectEmit(true, true, true, true);
        emit IERC734.Executed(executionId, address(target), 0, data);

        bool success = erc734.approve(executionId, true);
        assertTrue(success);

        // Verify execution was performed
        assertTrue(target.called());
        assertEq(target.value(), 42);
    }

    function test_Approve_Disapprove() public {
        bytes memory data = abi.encodeWithSelector(TargetContract.setValue.selector, 42);
        uint256 executionId = erc734.execute(address(target), 0, data);

        vm.expectEmit(true, true, false, false);
        emit IERC734.Approved(executionId, false);

        bool success = erc734.approve(executionId, false);
        assertTrue(success);

        // Verify execution was not performed
        assertFalse(target.called());
        assertEq(target.value(), 0);
    }

    function test_Approve_ExecutionFailed() public {
        bytes memory data = abi.encodeWithSelector(TargetContract.revertFunction.selector);
        uint256 executionId = erc734.execute(address(target), 0, data);

        vm.expectEmit(true, true, false, false);
        emit IERC734.Approved(executionId, true);

        vm.expectEmit(true, true, true, true);
        emit IERC734.ExecutionFailed(executionId, address(target), 0, data);

        bool success = erc734.approve(executionId, true);
        assertFalse(success); // Returns false when execution fails
    }

    function test_Approve_NonexistentExecution() public {
        // First create an execution so _executionNonce > 0
        bytes memory data = abi.encodeWithSelector(TargetContract.setValue.selector, 42);
        erc734.execute(address(target), 0, data);

        // Now try to approve a non-existent execution
        vm.expectRevert(abi.encodeWithSelector(ERC734.ExecutionIdDoesNotExist.selector, 999));
        erc734.approve(999, true);
    }

    function test_Approve_AlreadyExecuted() public {
        bytes memory data = abi.encodeWithSelector(TargetContract.setValue.selector, 42);
        uint256 executionId = erc734.execute(address(target), 0, data);

        // Execute once
        erc734.approve(executionId, true);

        // Try to execute again
        vm.expectRevert(abi.encodeWithSelector(ERC734.ExecutionAlreadyPerformed.selector, executionId));
        erc734.approve(executionId, true);
    }

    function test_KeyHasPurpose_ManagementKeyAccess() public {
        erc734.addKey(MANAGEMENT_KEY, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);

        // Management keys should have access to all purposes
        assertTrue(erc734.keyHasPurpose(MANAGEMENT_KEY, ERC734KeyPurposes.MANAGEMENT_KEY));
        assertTrue(erc734.keyHasPurpose(MANAGEMENT_KEY, ERC734KeyPurposes.ACTION_KEY));
        assertTrue(erc734.keyHasPurpose(MANAGEMENT_KEY, ERC734KeyPurposes.CLAIM_SIGNER_KEY));
        assertTrue(erc734.keyHasPurpose(MANAGEMENT_KEY, ERC734KeyPurposes.ENCRYPTION_KEY));
    }

    function test_KeyHasPurpose_NonexistentKey() public view {
        assertFalse(erc734.keyHasPurpose(TEST_KEY_1, ERC734KeyPurposes.MANAGEMENT_KEY));
    }

    function test_MultipleExecutions() public {
        bytes memory data1 = abi.encodeWithSelector(TargetContract.setValue.selector, 100);
        bytes memory data2 = abi.encodeWithSelector(TargetContract.setValue.selector, 200);

        uint256 executionId1 = erc734.execute(address(target), 0, data1);
        uint256 executionId2 = erc734.execute(address(target), 0, data2);

        assertEq(executionId1, 0);
        assertEq(executionId2, 1);

        // Execute second one first
        erc734.approve(executionId2, true);
        assertEq(target.value(), 200);

        // Execute first one
        erc734.approve(executionId1, true);
        assertEq(target.value(), 100);
    }

    function test_ExecuteWithValue() public payable {
        // Send value with execution
        uint256 value = 1 ether;
        bytes memory data = "";

        uint256 executionId = erc734.execute(address(target), value, data);

        uint256 initialBalance = address(target).balance;
        uint256 initialERC734Balance = address(erc734).balance;
        erc734.approve(executionId, true);

        assertEq(address(target).balance, initialBalance + value);
        assertEq(address(erc734).balance, initialERC734Balance - value);
    }
}
