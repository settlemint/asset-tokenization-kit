// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { Test, console2 } from "forge-std/Test.sol";
import { SMARTTokenRegistry } from "../contracts/SMARTTokenRegistry.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol"; // Corrected import path

contract SMARTTokenRegistryTest is Test {
    SMARTTokenRegistry registry;
    address owner;
    address user1;
    address mockToken;
    address mockForwarder;

    event TokenRegistered(address indexed token);
    event TokenUnregistered(address indexed token);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        mockToken = makeAddr("mockToken");
        mockForwarder = makeAddr("mockForwarder");

        vm.prank(owner);
        registry = new SMARTTokenRegistry(mockForwarder, owner);
    }

    // --- Test Constructor ---

    function test_Constructor_SetsOwnerCorrectly() public {
        assertEq(registry.owner(), owner, "Owner should be set correctly");
    }

    // --- Test registerToken ---

    function test_RegisterToken_Success() public {
        vm.prank(owner);
        vm.expectEmit(true, true, true, true, address(registry));
        emit TokenRegistered(mockToken);
        registry.registerToken(mockToken);
        assertTrue(registry.isTokenRegistered(mockToken), "Token should be registered");
    }

    function test_RegisterToken_Fail_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        registry.registerToken(mockToken);
    }

    function test_RegisterToken_Fail_InvalidTokenAddress() public {
        vm.prank(owner);
        vm.expectRevert(SMARTTokenRegistry.InvalidTokenAddress.selector);
        registry.registerToken(address(0));
    }

    function test_RegisterToken_Fail_TokenAlreadyRegistered() public {
        vm.prank(owner);
        registry.registerToken(mockToken); // First registration

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(SMARTTokenRegistry.TokenAlreadyRegistered.selector, mockToken));
        registry.registerToken(mockToken); // Attempt to register again
    }

    // --- Test unregisterToken ---

    function test_UnregisterToken_Success() public {
        // First, register the token
        vm.prank(owner);
        registry.registerToken(mockToken);
        assertTrue(registry.isTokenRegistered(mockToken), "Token should be registered initially");

        // Now, unregister
        vm.prank(owner);
        vm.expectEmit(true, true, true, true, address(registry));
        emit TokenUnregistered(mockToken);
        registry.unregisterToken(mockToken);
        assertFalse(registry.isTokenRegistered(mockToken), "Token should be unregistered");
    }

    function test_UnregisterToken_Fail_NotOwner() public {
        vm.prank(owner);
        registry.registerToken(mockToken); // Register token first

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        registry.unregisterToken(mockToken);
    }

    function test_UnregisterToken_Fail_InvalidTokenAddress() public {
        vm.prank(owner);
        vm.expectRevert(SMARTTokenRegistry.InvalidTokenAddress.selector);
        registry.unregisterToken(address(0));
    }

    function test_UnregisterToken_Fail_TokenNotRegistered() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(SMARTTokenRegistry.TokenNotRegistered.selector, mockToken));
        registry.unregisterToken(mockToken); // Attempt to unregister a token that was never registered
    }

    // --- Test ERC2771Context Overrides ---
    // Note: Testing _msgSender and _msgData thoroughly requires a more complex setup
    // with a real or mock ERC2771 forwarder.
    // For now, we rely on OpenZeppelin's tested implementation.
    // A basic check can ensure the functions don't revert.

    function test_MsgSender_ReturnsNonZero() public {
        // This test is basic and doesn't validate ERC2771 functionality deeply
        // It just checks that calling it (which happens internally) doesn't break.
        // When called directly by an EOA (not via forwarder), _msgSender should return msg.sender.
        vm.prank(owner);
        registry.registerToken(mockToken); // A function that uses _msgSender()
        assertTrue(registry.isTokenRegistered(mockToken), "Token registration using internal _msgSender should succeed");
    }
}
