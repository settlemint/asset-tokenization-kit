// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { DvPSwapFactory } from "../contracts/DvPSwapFactory.sol";
import { DvPSwap } from "../contracts/DvPSwap.sol";
import { Forwarder } from "../contracts/Forwarder.sol";

contract DvPSwapFactoryTest is Test {
    DvPSwapFactory public factory;
    Forwarder public forwarder;
    address public owner;
    address public user1;
    address public user2;
    
    event DvPSwapCreated(address indexed token, address indexed creator);
    
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
        
        address predicted = factory.predictAddress(name);
        
        vm.expectEmit(true, true, false, true);
        emit DvPSwapCreated(predicted, user1);
        
        address dvpSwapContract = factory.create(name);
        vm.stopPrank();
        
        assertEq(dvpSwapContract, predicted);
        assertTrue(factory.isAddressDeployed(dvpSwapContract));
        assertTrue(factory.isFactoryToken(dvpSwapContract));
        
        // Verify the swap contract is properly initialized
        DvPSwap swap = DvPSwap(dvpSwapContract);
        // Verify roles are assigned to creator (user1) - matching other factories
        assertTrue(swap.hasRole(swap.DEFAULT_ADMIN_ROLE(), user1));
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
        
        address predicted1 = factory.predictAddress(name1);
        address predicted2 = factory.predictAddress(name2);
        
        // Different names should result in different addresses
        assertNotEq(predicted1, predicted2);
        
        vm.stopPrank();
    }
    
    function test_PredictAddressWithDifferentCreators() public {
        string memory name = "DvPSwap Exchange 1";
        
        // Different creators with the same name should result in the same address
        // since we're using only the name to calculate the salt
        address predicted = factory.predictAddress(name);
        
        vm.prank(user1);
        address created1 = factory.create(name);
        
        // Create a new factory for user2
        Forwarder newForwarder = new Forwarder();
        DvPSwapFactory newFactory = new DvPSwapFactory(address(newForwarder));
        
        vm.prank(user2);
        string memory sameName = "DvPSwap Exchange 1";
        address predicted2 = newFactory.predictAddress(sameName);
        
        // Different factory with same parameters should give different address
        assertNotEq(predicted, predicted2);
    }
    
    function test_DeterministicAddresses() public {
        string memory name = "DvPSwap Exchange 1";
        
        vm.startPrank(user1);
        
        address predicted = factory.predictAddress(name);
        address actual = factory.create(name);
        
        assertEq(actual, predicted);
        
        vm.stopPrank();
        
        // Create a new factory
        DvPSwapFactory newFactory = new DvPSwapFactory(address(forwarder));
        
        vm.startPrank(user1);
        
        // The address should be different with the new factory, even with the same name and creator
        address newPredicted = newFactory.predictAddress(name);
        assertNotEq(newPredicted, predicted);
        
        vm.stopPrank();
    }
    
    function test_CreateMultipleContracts() public {
        uint8 count = 5; // Create 5 contracts
        
        vm.startPrank(user1);
        
        address[] memory dvpSwapContracts = new address[](count);
        
        // Check initial length is zero
        assertEq(factory.allSwapsLength(), 0);
        
        for (uint8 i = 0; i < count; i++) {
            string memory name = string(abi.encodePacked("DvPSwap Exchange ", vm.toString(i + 1)));
            address predicted = factory.predictAddress(name);
            address actual = factory.create(name);
            
            assertEq(actual, predicted);
            assertTrue(factory.isFactoryToken(actual));
            
            dvpSwapContracts[i] = actual;
            
            // Check allSwaps is being updated
            assertEq(factory.allSwapsLength(), i + 1);
            assertEq(factory.allSwaps(i), actual);
            
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
        
        address predicted = factory.predictAddress(name);
        assertFalse(factory.isAddressDeployed(predicted));
        
        address dvpSwapContract = factory.create(name);
        assertTrue(factory.isAddressDeployed(dvpSwapContract));
        
        vm.stopPrank();
        
        // Random address should not be deployed
        address randomAddr = makeAddr("random");
        assertFalse(factory.isAddressDeployed(randomAddr));
    }
    
    function test_DvPSwapInitialization() public {
        string memory name = "DvPSwap Exchange Init Test";
        
        vm.prank(user1);
        address dvpSwapContract = factory.create(name);
        
        // Verify the created DvPSwap contract has the correct initialization
        DvPSwap swap = DvPSwap(dvpSwapContract);
        
        // Check admin role is set to creator (user1) - matching other factories
        assertTrue(swap.hasRole(swap.DEFAULT_ADMIN_ROLE(), user1));
        
        // Check trustedForwarder is set correctly
        assertEq(address(swap.trustedForwarder()), address(forwarder));
        
        // Check that contract is not paused initially
        assertFalse(swap.paused());
        
        // Verify admin (user1) can pause the contract
        vm.prank(user1);
        swap.pause();
        assertTrue(swap.paused());
        
        // Verify admin (user1) can unpause the contract
        vm.prank(user1);
        swap.unpause();
        assertFalse(swap.paused());
    }
    
    function test_FactoryWithDifferentForwarder() public {
        // Deploy a new forwarder
        Forwarder newForwarder = new Forwarder();
        
        // Deploy a new factory with the new forwarder
        DvPSwapFactory newFactory = new DvPSwapFactory(address(newForwarder));
        
        string memory name = "DvPSwap With New Forwarder";
        
        vm.prank(user1);
        address dvpSwapContract = newFactory.create(name);
        
        // Verify the created DvPSwap uses the new forwarder
        DvPSwap swap = DvPSwap(dvpSwapContract);
        assertEq(address(swap.trustedForwarder()), address(newForwarder));
        assertNotEq(address(swap.trustedForwarder()), address(forwarder));
    }
    
    function test_ForwarderZeroAddressReverts() public {
        // Try to deploy factory with zero address for forwarder
        vm.expectRevert(abi.encodeWithSignature("ZeroAddressNotAllowed()"));
        new DvPSwapFactory(address(0));
    }
    
    function test_EventEmission() public {
        string memory name = "Test DvPSwap";
        
        vm.recordLogs();
        vm.prank(user1);
        address dvpSwapContract = factory.create(name);
        
        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        
        // Should emit multiple events but we're specifically checking for DvPSwapCreated
        bool foundCreatedEvent = false;
        for (uint i = 0; i < entries.length; i++) {
            // Check for DvPSwapCreated event
            if (entries[i].topics[0] == keccak256("DvPSwapCreated(address,address)")) {
                foundCreatedEvent = true;
                assertEq(address(uint160(uint256(entries[i].topics[1]))), dvpSwapContract, "Wrong swap address in event");
                assertEq(address(uint160(uint256(entries[i].topics[2]))), user1, "Wrong creator address in event");
            }
        }
        
        assertTrue(foundCreatedEvent, "DvPSwapCreated event not found");
    }
    
    function test_AllSwapsTracking() public {
        uint8 count = 3; // Create 3 contracts
        
        vm.startPrank(user1);
        
        for (uint8 i = 0; i < count; i++) {
            string memory name = string(abi.encodePacked("DvPSwap Exchange ", vm.toString(i + 1)));
            address swapContract = factory.create(name);
            
            // Verify correct tracking
            assertEq(factory.allSwapsLength(), i + 1);
            assertEq(factory.allSwaps(i), swapContract);
        }
        
        vm.stopPrank();
    }
} 