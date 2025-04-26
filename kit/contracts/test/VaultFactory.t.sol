// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test, console } from "forge-std/Test.sol";
import { VaultFactory } from "../contracts/VaultFactory.sol";
import { Vault } from "../contracts/Vault.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol"; // Needed for address calculation
    // comparison

contract VaultFactoryTest is Test {
    VaultFactory public factory;
    address public owner;
    address public forwarder;
    address[] public signers;
    uint256 public requiredConfirmations;

    event VaultCreated(address indexed vault, address indexed creator);

    function setUp() public {
        owner = address(this); // Use the test contract itself as the owner for simplicity
        forwarder = address(0xdead); // Use a mock forwarder address
        factory = new VaultFactory(forwarder);

        signers.push(address(0x1));
        signers.push(address(0x2));
        requiredConfirmations = 2;
    }

    function test_PredictAddress() public view {
        address predicted = factory.predictAddress(owner, signers, requiredConfirmations);
        assertTrue(predicted != address(0), "Predicted address should not be zero");

        // Predict with different owner - should be different address
        address predictedDifferentOwner = factory.predictAddress(address(0xbeef), signers, requiredConfirmations);
        assertTrue(predicted != predictedDifferentOwner, "Predicted address should change with owner");

        // Predict with different signers - should be different address
        address[] memory differentSigners = new address[](1);
        differentSigners[0] = address(0x3);
        address predictedDifferentSigners = factory.predictAddress(owner, differentSigners, requiredConfirmations);
        assertTrue(predicted != predictedDifferentSigners, "Predicted address should change with signers");

        // Predict with different required confirmations - should be different address
        address predictedDifferentRequired = factory.predictAddress(owner, signers, 1);
        assertTrue(
            predicted != predictedDifferentRequired, "Predicted address should change with required confirmations"
        );
    }

    function test_CreateVault() public {
        address predicted = factory.predictAddress(owner, signers, requiredConfirmations);
        assertFalse(factory.isAddressDeployed(predicted), "Address should not be deployed yet");

        // Check the event emitted by the factory
        vm.expectEmit(true, true, false, false); // Match VaultCreated(address indexed vault, address indexed creator,
            // address[] signers, uint256 required)
        address vaultAddr = factory.create(signers, requiredConfirmations);

        assertEq(vaultAddr, predicted, "Created vault address should match predicted address");
        assertTrue(factory.isAddressDeployed(vaultAddr), "isAddressDeployed should be true after creation");

        // Verify vault properties
        Vault createdVault = Vault(payable(vaultAddr));
        assertTrue(
            createdVault.hasRole(createdVault.DEFAULT_ADMIN_ROLE(), owner), "Initial owner should have admin role"
        );
        assertTrue(createdVault.hasRole(createdVault.SIGNER_ROLE(), signers[0]), "Signer 1 should have signer role");
        assertTrue(createdVault.hasRole(createdVault.SIGNER_ROLE(), signers[1]), "Signer 2 should have signer role");
        assertEq(createdVault.requirement(), requiredConfirmations, "Required confirmations should be set");
        assertEq(address(createdVault.trustedForwarder()), forwarder, "Forwarder should be set in vault");
    }

    function test_CreateVault_Revert_AddressAlreadyDeployed() public {
        address predicted = factory.predictAddress(owner, signers, requiredConfirmations);

        // First creation should succeed
        factory.create(signers, requiredConfirmations);
        assertTrue(factory.isAddressDeployed(predicted), "Vault should be marked as deployed");

        // Second creation with same parameters should fail
        vm.expectRevert(VaultFactory.AddressAlreadyDeployed.selector);
        factory.create(signers, requiredConfirmations);
    }

    function test_IsAddressDeployed() public {
        address nonDeployedAddress = address(0xcafe);
        assertFalse(factory.isAddressDeployed(nonDeployedAddress), "Random address should not be marked as deployed");

        address vaultAddr = factory.create(signers, requiredConfirmations);
        assertTrue(factory.isAddressDeployed(vaultAddr), "Created vault address should be marked as deployed");
    }
}
