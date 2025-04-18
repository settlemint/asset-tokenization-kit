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
    
    event DvPSwapContractCreated(address indexed dvpSwapContract, address indexed creator);
    
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
        string memory name = "DvPSwap Exchange 1";
        
        vm.startPrank(user1);
        
        address predicted = factory.predictAddress(user1, name);
        
        vm.expectEmit(true, true, false, true);
        emit DvPSwapContractCreated(predicted, user1);
        
        address dvpSwapContract = factory.create(name);
        vm.stopPrank();
        
        assertEq(dvpSwapContract, predicted);
        assertTrue(factory.isAddressDeployed(dvpSwapContract));
        assertTrue(factory.isDvPSwapFromFactory(dvpSwapContract));
        
        // Verify the swap contract is properly initialized
        DvPSwap swap = DvPSwap(dvpSwapContract);
        assertTrue(swap.hasRole(swap.DEFAULT_ADMIN_ROLE(), user1));
        assertTrue(swap.hasRole(swap.PAUSER_ROLE(), user1));
        assertEq(address(swap.trustedForwarder()), address(forwarder));
    }
    
    function test_RevertOnDuplicateAddress() public {
        string memory name = "DvPSwap Exchange 1";
        
        vm.startPrank(user1);
        
        // First creation should succeed
        factory.create(name);
        
        // Second creation with same name should fail
        vm.expectRevert(abi.encodeWithSignature("AddressAlreadyDeployed()"));
        factory.create(name);
        
        vm.stopPrank();
    }
    
    function test_PredictAddressWithDifferentNames() public {
        string memory name1 = "DvPSwap Exchange 1";
        string memory name2 = "DvPSwap Exchange 2";
        
        vm.startPrank(user1);
        
        address predicted1 = factory.predictAddress(user1, name1);
        address predicted2 = factory.predictAddress(user1, name2);
        
        // Different names should result in different addresses
        assertNotEq(predicted1, predicted2);
        
        vm.stopPrank();
    }
    
    function test_PredictAddressWithDifferentCreators() public {
        string memory name = "DvPSwap Exchange 1";
        
        address predicted1 = factory.predictAddress(user1, name);
        address predicted2 = factory.predictAddress(user2, name);
        
        // Different creators with the same name should still result in the same address
        // since we're now using only the name to calculate the salt
        assertEq(predicted1, predicted2);
    }
    
    function test_DeterministicAddresses() public {
        string memory name = "DvPSwap Exchange 1";
        
        vm.startPrank(user1);
        
        address predicted = factory.predictAddress(user1, name);
        address actual = factory.create(name);
        
        assertEq(actual, predicted);
        
        vm.stopPrank();
        
        // Create a new factory
        DvPSwapFactory newFactory = new DvPSwapFactory(address(forwarder));
        
        vm.startPrank(user1);
        
        // The address should be different with the new factory, even with the same name and creator
        address newPredicted = newFactory.predictAddress(user1, name);
        assertNotEq(newPredicted, predicted);
        
        vm.stopPrank();
    }
    
    function test_CreateMultipleContracts() public {
        uint8 count = 5; // Create 5 contracts
        
        vm.startPrank(user1);
        
        address[] memory dvpSwapContracts = new address[](count);
        
        for (uint8 i = 0; i < count; i++) {
            string memory name = string(abi.encodePacked("DvPSwap Exchange ", vm.toString(i + 1)));
            address predicted = factory.predictAddress(user1, name);
            address actual = factory.create(name);
            
            assertEq(actual, predicted);
            assertTrue(factory.isDvPSwapFromFactory(actual));
            
            dvpSwapContracts[i] = actual;
            
            // Ensure all created contracts are different
            for (uint8 j = 0; j < i; j++) {
                assertNotEq(dvpSwapContracts[i], dvpSwapContracts[j]);
            }
        }
        
        vm.stopPrank();
    }
    
    function test_isAddressDeployed() public {
        string memory name = "DvPSwap Exchange 1";
        
        vm.startPrank(user1);
        
        address predicted = factory.predictAddress(user1, name);
        assertFalse(factory.isAddressDeployed(predicted));
        
        address dvpSwapContract = factory.create(name);
        assertTrue(factory.isAddressDeployed(dvpSwapContract));
        
        vm.stopPrank();
        
        // Random address should not be deployed
        address randomAddr = makeAddr("random");
        assertFalse(factory.isAddressDeployed(randomAddr));
    }
} 