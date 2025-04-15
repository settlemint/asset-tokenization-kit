// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { DvPSwapFactory } from "../contracts/DvPSwapFactory.sol";
import { DvPSwap } from "../contracts/DvPSwap.sol";
import { Forwarder } from "../contracts/Forwarder.sol";

contract DvPSwapFactoryTest is Test {
    DvPSwapFactory public factory;
    Forwarder public forwarder;
    address public owner;
    address public user1;
    address public user2;
    
    event DvPSwapContractCreated(address indexed swapContract, address indexed creator);
    
    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy forwarder first
        forwarder = new Forwarder();
        
        // Deploy factory
        factory = new DvPSwapFactory(address(forwarder));
    }
    
    function test_CreateSwapContract() public {
        bytes32 salt = bytes32(uint256(1));
        
        vm.startPrank(user1);
        
        address predicted = factory.predictAddress(user1, salt);
        
        vm.expectEmit(true, true, false, true);
        emit DvPSwapContractCreated(predicted, user1);
        
        address swapContract = factory.create(salt);
        vm.stopPrank();
        
        assertEq(swapContract, predicted);
        assertTrue(factory.isAddressDeployed(swapContract));
        assertTrue(factory.isFactorySwap(swapContract));
        
        // Verify the swap contract is properly initialized
        DvPSwap swap = DvPSwap(swapContract);
        assertTrue(swap.hasRole(swap.DEFAULT_ADMIN_ROLE(), user1));
        assertTrue(swap.hasRole(swap.PAUSER_ROLE(), user1));
        assertEq(address(swap.trustedForwarder()), address(forwarder));
    }
    
    function test_RevertOnDuplicateAddress() public {
        bytes32 salt = bytes32(uint256(1));
        
        vm.startPrank(user1);
        
        // First creation should succeed
        factory.create(salt);
        
        // Second creation with same salt should fail
        vm.expectRevert(abi.encodeWithSignature("AddressAlreadyDeployed()"));
        factory.create(salt);
        
        vm.stopPrank();
    }
    
    function testFuzz_PredictAddressWithDifferentSalts(bytes32 salt1, bytes32 salt2) public {
        vm.assume(salt1 != salt2);
        
        vm.startPrank(user1);
        
        address predicted1 = factory.predictAddress(user1, salt1);
        address predicted2 = factory.predictAddress(user1, salt2);
        
        // Different salts should result in different addresses
        assertNotEq(predicted1, predicted2);
        
        vm.stopPrank();
    }
    
    function test_PredictAddressWithDifferentCreators() public {
        bytes32 salt = bytes32(uint256(1));
        
        address predicted1 = factory.predictAddress(user1, salt);
        address predicted2 = factory.predictAddress(user2, salt);
        
        // Different creators with the same salt should result in different addresses
        assertNotEq(predicted1, predicted2);
    }
    
    function test_DeterministicAddresses() public {
        bytes32 salt = bytes32(uint256(1));
        
        vm.startPrank(user1);
        
        address predicted = factory.predictAddress(user1, salt);
        address actual = factory.create(salt);
        
        assertEq(actual, predicted);
        
        vm.stopPrank();
        
        // Create a new factory
        DvPSwapFactory newFactory = new DvPSwapFactory(address(forwarder));
        
        vm.startPrank(user1);
        
        // The address should be different with the new factory, even with the same salt and creator
        address newPredicted = newFactory.predictAddress(user1, salt);
        assertNotEq(newPredicted, predicted);
        
        vm.stopPrank();
    }
    
    function testFuzz_CreateMultipleContracts(uint8 count) public {
        vm.assume(count > 0 && count <= 10); // Limit to reasonable count
        
        vm.startPrank(user1);
        
        address[] memory swapContracts = new address[](count);
        
        for (uint8 i = 0; i < count; i++) {
            bytes32 salt = bytes32(uint256(i + 1)); // Use i+1 to avoid salt=0
            address predicted = factory.predictAddress(user1, salt);
            address actual = factory.create(salt);
            
            assertEq(actual, predicted);
            assertTrue(factory.isFactorySwap(actual));
            
            swapContracts[i] = actual;
            
            // Ensure all created contracts are different
            for (uint8 j = 0; j < i; j++) {
                assertNotEq(swapContracts[i], swapContracts[j]);
            }
        }
        
        vm.stopPrank();
    }
    
    function test_isAddressDeployed() public {
        bytes32 salt = bytes32(uint256(1));
        
        vm.startPrank(user1);
        
        address predicted = factory.predictAddress(user1, salt);
        assertFalse(factory.isAddressDeployed(predicted));
        
        address swapContract = factory.create(salt);
        assertTrue(factory.isAddressDeployed(swapContract));
        
        vm.stopPrank();
        
        // Random address should not be deployed
        address randomAddr = makeAddr("random");
        assertFalse(factory.isAddressDeployed(randomAddr));
    }
} 