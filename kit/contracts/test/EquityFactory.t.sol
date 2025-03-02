// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { VmSafe } from "forge-std/Vm.sol";
import { EquityFactory } from "../contracts/EquityFactory.sol";
import { Equity } from "../contracts/Equity.sol";
import { Forwarder } from "../contracts/Forwarder.sol";

contract EquityFactoryTest is Test {
    EquityFactory public factory;
    Forwarder public forwarder;
    address public owner;
    uint8 public constant DECIMALS = 8;

    function setUp() public {
        owner = makeAddr("owner");
        // Deploy forwarder first
        forwarder = new Forwarder();
        // Then deploy factory with forwarder address
        factory = new EquityFactory(address(forwarder));
    }

    function test_CreateToken() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        vm.prank(owner);
        address tokenAddress = factory.create(name, symbol, DECIMALS, class, category);

        assertNotEq(tokenAddress, address(0), "Token address should not be zero");

        Equity token = Equity(tokenAddress);
        assertEq(token.name(), name, "Token name should match");
        assertEq(token.symbol(), symbol, "Token symbol should match");
        assertEq(token.decimals(), DECIMALS, "Token decimals should match");
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner), "Owner should have admin role");
        assertTrue(token.hasRole(token.SUPPLY_MANAGEMENT_ROLE(), owner), "Owner should have supply management role");
        assertTrue(token.hasRole(token.USER_MANAGEMENT_ROLE(), owner), "Owner should have user management role");
        assertEq(token.equityClass(), class, "Token class should match");
        assertEq(token.equityCategory(), category, "Token category should match");
    }

    function test_CreateMultipleTokens() public {
        string memory baseName = "Test Equity ";
        string memory baseSymbol = "TEQT";
        uint8[] memory decimalValues = new uint8[](3);
        decimalValues[0] = 6;
        decimalValues[1] = 8;
        decimalValues[2] = 18;
        string[] memory classes = new string[](3);
        classes[0] = "Common";
        classes[1] = "Preferred";
        classes[2] = "Restricted";
        string[] memory categories = new string[](3);
        categories[0] = "Series A";
        categories[1] = "Series B";
        categories[2] = "Seed";

        for (uint256 i = 0; i < decimalValues.length; i++) {
            string memory name = string(abi.encodePacked(baseName, vm.toString(i + 1)));
            string memory symbol = string(abi.encodePacked(baseSymbol, vm.toString(i + 1)));

            address tokenAddress = factory.create(name, symbol, decimalValues[i], classes[i], categories[i]);
            assertNotEq(tokenAddress, address(0), "Token address should not be zero");

            Equity token = Equity(tokenAddress);
            assertEq(token.decimals(), decimalValues[i], "Token decimals should match");
            assertEq(token.equityClass(), classes[i], "Token class should match");
            assertEq(token.equityCategory(), categories[i], "Token category should match");
        }
    }

    function test_DeterministicAddresses() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        address token1 = factory.create(name, symbol, DECIMALS, class, category);

        // Create a new factory instance
        EquityFactory newFactory = new EquityFactory(address(forwarder));

        // Create a token with the same parameters
        address token2 = newFactory.create(name, symbol, DECIMALS, class, category);

        // The addresses should be different because the factory addresses are different
        assertNotEq(token1, token2, "Tokens should have different addresses due to different factory addresses");
    }

    function test_TokenInitialization() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        address tokenAddress = factory.create(name, symbol, DECIMALS, class, category);
        Equity token = Equity(tokenAddress);

        // Test initial state
        assertEq(token.decimals(), DECIMALS, "Decimals should match");
        assertFalse(token.paused(), "Token should not be paused initially");
        assertEq(token.totalSupply(), 0, "Initial supply should be zero");
        assertEq(token.getVotes(owner), 0, "Initial voting power should be zero");
    }

    function test_TokenFunctionality() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        vm.startPrank(owner);
        address tokenAddress = factory.create(name, symbol, DECIMALS, class, category);
        Equity token = Equity(tokenAddress);

        // Test minting with supply management role
        uint256 amount = 1000 ether;
        address user = makeAddr("user");
        token.mint(owner, amount);
        assertEq(token.balanceOf(owner), amount, "Balance should match minted amount");

        // Delegate voting power to self
        token.delegate(owner);
        assertEq(token.getVotes(owner), amount, "Voting power should match balance after delegation");

        // Test pausing with admin role
        token.pause();
        assertTrue(token.paused(), "Token should be paused");
        vm.stopPrank();

        // Test minting without supply management role
        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user, token.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        token.mint(user, amount);
        vm.stopPrank();

        // Test pausing without admin role
        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user, token.DEFAULT_ADMIN_ROLE()
            )
        );
        token.pause();
        vm.stopPrank();

        // Test unpausing with admin role
        vm.startPrank(owner);
        token.unpause();
        assertFalse(token.paused(), "Token should be unpaused");
        vm.stopPrank();
    }

    function test_EventEmission() public {
        string memory name = "Test Equity";
        string memory symbol = "TEQT";
        string memory class = "Common";
        string memory category = "Series A";

        vm.recordLogs();
        address tokenAddress = factory.create(name, symbol, DECIMALS, class, category);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(
            entries.length,
            4,
            "Should emit 4 events: RoleGranted (admin), RoleGranted (supply), RoleGranted (user), and EquityCreated"
        );

        // First event should be RoleGranted for DEFAULT_ADMIN_ROLE
        VmSafe.Log memory firstEntry = entries[0];
        assertEq(
            firstEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for first RoleGranted"
        );
        assertEq(
            firstEntry.topics[1],
            bytes32(0), // DEFAULT_ADMIN_ROLE is bytes32(0)
            "Wrong role in first RoleGranted"
        );

        // Second event should be RoleGranted for SUPPLY_MANAGEMENT_ROLE
        VmSafe.Log memory secondEntry = entries[1];
        assertEq(
            secondEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for second RoleGranted"
        );

        // Third event should be RoleGranted for USER_MANAGEMENT_ROLE
        VmSafe.Log memory thirdEntry = entries[2];
        assertEq(
            thirdEntry.topics[0],
            keccak256("RoleGranted(bytes32,address,address)"),
            "Wrong event signature for third RoleGranted"
        );

        // Fourth event should be EquityCreated
        VmSafe.Log memory lastEntry = entries[3];
        assertEq(
            lastEntry.topics[0], keccak256("EquityCreated(address,address)"), "Wrong event signature for EquityCreated"
        );
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), tokenAddress, "Wrong token address in event");
        assertEq(address(uint160(uint256(lastEntry.topics[2]))), address(this), "Wrong creator address in event");
    }
}
