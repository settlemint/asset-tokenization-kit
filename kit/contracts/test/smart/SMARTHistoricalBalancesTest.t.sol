// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import {
    ISMARTHistoricalBalances
} from "../../contracts/smart/extensions/historical-balances/ISMARTHistoricalBalances.sol";
import {
    _SMARTHistoricalBalancesLogic
} from "../../contracts/smart/extensions/historical-balances/internal/_SMARTHistoricalBalancesLogic.sol";
import { console } from "forge-std/Test.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    SMARTComplianceModuleParamPair
} from "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMARTCompliance } from "../../contracts/smart/interface/ISMARTCompliance.sol";
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";

// Concrete test implementation of the historical balances logic
contract TestHistoricalBalancesToken is ERC20, _SMARTHistoricalBalancesLogic {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        __SMARTHistoricalBalances_init_unchained();
    }

    // Public mint function for testing
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Public burn function for testing
    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }

    function recoverTokens(address) external pure {
        revert("Not implemented");
    }

    // Override _update to add historical balance tracking
    function _update(address from, address to, uint256 value) internal virtual override {
        super._update(from, to, value);

        // Call historical balances hooks
        if (from == address(0)) {
            // Minting
            __historical_balances_afterMintLogic(to, value);
        } else if (to == address(0)) {
            // Burning
            __historical_balances_afterBurnLogic(from, value);
        } else {
            // Transfer
            __historical_balances_afterTransferLogic(from, to, value);
        }
    }

    // Implement _smartSender for SMARTContext
    function _smartSender() internal view virtual override returns (address) {
        return msg.sender;
    }

    // Implement supportsInterface for ERC165
    function supportsInterface(bytes4 interfaceId) public pure override returns (bool) {
        return interfaceId == type(ISMARTHistoricalBalances).interfaceId;
    }

    // Dummy implementations for ISMART interface to satisfy abstract contract
    function addComplianceModule(address, bytes calldata) external override { }
    function batchMint(address[] calldata, uint256[] calldata) external override { }
    function batchTransfer(address[] calldata, uint256[] calldata) external override { }

    function compliance() external pure override returns (ISMARTCompliance) {
        return ISMARTCompliance(address(0));
    }

    function complianceModules() external pure override returns (SMARTComplianceModuleParamPair[] memory) {
        return new SMARTComplianceModuleParamPair[](0);
    }

    function identityRegistry() external pure override returns (ISMARTIdentityRegistry) {
        return ISMARTIdentityRegistry(address(0));
    }

    function onchainID() external pure override returns (address) {
        return address(0);
    }

    function recoverERC20(address, address, uint256) external override { }
    function removeComplianceModule(address) external override { }

    function setCompliance(address) external override { }
    function setIdentityRegistry(address) external override { }
    function setOnchainID(address) external override { }
    function setParametersForComplianceModule(address, bytes calldata) external override { }
}

contract SMARTHistoricalBalancesTest is Test {
    TestHistoricalBalancesToken public token;

    address public alice;
    address public bob;
    address public charlie;

    event CheckpointUpdated(
        address indexed sender, address indexed account, uint256 indexed oldBalance, uint256 newBalance
    );

    function setUp() public {
        // Set up test accounts
        alice = address(0x1);
        bob = address(0x2);
        charlie = address(0x3);

        // Start at timestamp 1000 to have room for historical queries
        vm.warp(1000);

        // Deploy test token
        token = new TestHistoricalBalancesToken("Historical Test Token", "HTT");

        // Mint initial tokens for testing
        token.mint(alice, 1000 * 10 ** 18);

        // Advance time to ensure we can query the initial state
        vm.warp(block.timestamp + 1);
    }

    function testClockFunctionality() public view {
        console.log("Testing clock functionality...");

        uint48 currentTime = token.clock();
        assertEq(currentTime, uint48(block.timestamp), "Clock should return current timestamp");

        string memory clockMode = token.CLOCK_MODE();
        assertEq(clockMode, "mode=timestamp", "Clock mode should be timestamp");
    }

    function testInitialState() public view {
        console.log("Testing initial state...");

        uint256 initialTime = block.timestamp - 1; // Query the past timestamp

        // Check initial balances at past time
        uint256 aliceBalance = token.balanceOfAt(alice, initialTime);
        uint256 totalSupply = token.totalSupplyAt(initialTime);

        assertEq(aliceBalance, 1000 * 10 ** 18, "Alice should have initial balance");
        assertEq(totalSupply, 1000 * 10 ** 18, "Total supply should match minted amount");

        // Check zero balance for accounts that haven't received tokens
        uint256 bobBalance = token.balanceOfAt(bob, initialTime);
        assertEq(bobBalance, 0, "Bob should have zero balance");
    }

    function testCheckpointCreation() public {
        console.log("Testing checkpoint creation...");

        uint256 time1 = 1000; // The time right after initial mint

        // Transfer tokens
        vm.warp(1200);
        vm.prank(alice);
        assertTrue(token.transfer(bob, 100 * 10 ** 18), "Transfer failed");
        uint256 time2 = 1200; // Record transfer time

        // Advance time to query the past
        vm.warp(1300);

        // Check balances at time2 (now in the past)
        assertEq(token.balanceOfAt(alice, time2), 900 * 10 ** 18, "Alice balance after transfer");
        assertEq(token.balanceOfAt(bob, time2), 100 * 10 ** 18, "Bob balance after transfer");

        // Historical balances at time1 should remain unchanged
        assertEq(token.balanceOfAt(alice, time1), 1000 * 10 ** 18, "Alice historical balance");
        assertEq(token.balanceOfAt(bob, time1), 0, "Bob historical balance");
    }

    function testHistoricalQueries() public {
        console.log("Testing historical queries...");

        uint256[] memory timepoints = new uint256[](5);
        timepoints[0] = 1000; // Use the time right after initial setup

        // Perform multiple transfers at different times
        for (uint256 i = 1; i < 5; i++) {
            vm.warp(1000 + (i * 100));
            vm.prank(alice);
            assertTrue(token.transfer(bob, 50 * 10 ** 18), "Transfer failed");
            timepoints[i] = 1000 + (i * 100); // Record explicit time
        }

        // Advance time to ensure all queries are in the past
        vm.warp(2000);

        // Query historical balances at each timepoint
        for (uint256 i = 0; i < 5; i++) {
            uint256 expectedAlice = 1000 * 10 ** 18 - (i * 50 * 10 ** 18);
            uint256 expectedBob = i * 50 * 10 ** 18;

            assertEq(
                token.balanceOfAt(alice, timepoints[i]),
                expectedAlice,
                string.concat("Alice balance at timepoint ", vm.toString(i))
            );
            assertEq(
                token.balanceOfAt(bob, timepoints[i]),
                expectedBob,
                string.concat("Bob balance at timepoint ", vm.toString(i))
            );
        }
    }

    function testFutureLookupError() public {
        console.log("Testing future lookup error...");

        uint256 currentTime = block.timestamp;
        uint256 futureTime = block.timestamp + 1000;

        // Test future time
        vm.expectRevert(abi.encodeWithSelector(ISMARTHistoricalBalances.FutureLookup.selector, futureTime, currentTime));
        token.balanceOfAt(alice, futureTime);

        vm.expectRevert(abi.encodeWithSelector(ISMARTHistoricalBalances.FutureLookup.selector, futureTime, currentTime));
        token.totalSupplyAt(futureTime);
    }

    function testMultipleCheckpoints() public {
        console.log("Testing multiple checkpoints and binary search...");

        // Create many checkpoints to test binary search
        uint256[] memory amounts = new uint256[](20);
        uint256[] memory times = new uint256[](20);

        // Fix warp issue in the same block
        for (uint256 i = 0; i < 20; i++) {
            amounts[i] = (i + 1) * 10 ** 18;

            vm.prank(alice);
            assertTrue(token.transfer(bob, amounts[i]), "Transfer failed");
            times[i] = block.timestamp; // Record time after transfer

            // Ensure we advance time for next iteration
            if (i < 19) {
                vm.warp(block.timestamp + 10);
            }
        }

        // Advance time to query the past
        vm.warp(block.timestamp + 100);

        // Query at various points
        uint256 cumulative = 0;
        for (uint256 i = 0; i < 20; i++) {
            cumulative += amounts[i];
            uint256 expectedAlice = 1000 * 10 ** 18 - cumulative;
            uint256 expectedBob = cumulative;

            assertEq(token.balanceOfAt(alice, times[i]), expectedAlice, "Alice balance check");
            assertEq(token.balanceOfAt(bob, times[i]), expectedBob, "Bob balance check");
        }

        // Query at time between checkpoints
        uint256 midTime = (times[10] + times[11]) / 2;
        cumulative = 0;
        for (uint256 i = 0; i <= 10; i++) {
            cumulative += amounts[i];
        }
        assertEq(token.balanceOfAt(bob, midTime), cumulative, "Balance at mid-point");
    }

    function testEdgeCases() public {
        console.log("Testing edge cases...");

        // Test zero amount transfer
        vm.warp(1500);
        vm.prank(alice);
        assertTrue(token.transfer(bob, 0), "Transfer failed");
        uint256 timeAfterZeroTransfer = 1500;

        // Advance time and check
        vm.warp(1600);
        uint256 balanceAfter = token.balanceOfAt(alice, timeAfterZeroTransfer);
        assertEq(balanceAfter, 1000 * 10 ** 18, "Balance unchanged on zero transfer");

        // Test multiple operations in same block
        vm.warp(1700);
        uint256 time1 = 1700;
        vm.startPrank(alice);
        assertTrue(token.transfer(bob, 10 * 10 ** 18), "Transfer failed");
        assertTrue(token.transfer(charlie, 20 * 10 ** 18), "Transfer failed");
        vm.stopPrank();

        // Advance time to query
        vm.warp(1800);

        // Both transfers should be reflected at the same timestamp
        assertEq(token.balanceOfAt(alice, time1), 970 * 10 ** 18, "Alice balance after multiple transfers");
        assertEq(token.balanceOfAt(bob, time1), 10 * 10 ** 18, "Bob balance");
        assertEq(token.balanceOfAt(charlie, time1), 20 * 10 ** 18, "Charlie balance");

        // Test querying at timestamp 0
        assertEq(token.balanceOfAt(alice, 0), 0, "Balance at timestamp 0");
        assertEq(token.totalSupplyAt(0), 0, "Total supply at timestamp 0");
    }

    function testEventEmissions() public {
        console.log("Testing event emissions...");

        // Test mint event
        vm.expectEmit(true, true, true, true, address(token));
        emit CheckpointUpdated(address(this), charlie, 0, 100 * 10 ** 18);

        token.mint(charlie, 100 * 10 ** 18);

        // Advance time
        vm.warp(block.timestamp + 10);

        // Get current balances for next event check
        uint256 aliceCurrentBalance = token.balanceOf(alice);
        uint256 bobCurrentBalance = token.balanceOf(bob);

        // Test transfer events
        vm.expectEmit(true, true, true, true, address(token));
        emit CheckpointUpdated(alice, alice, aliceCurrentBalance, aliceCurrentBalance - 50 * 10 ** 18);

        vm.expectEmit(true, true, true, true, address(token));
        emit CheckpointUpdated(alice, bob, bobCurrentBalance, bobCurrentBalance + 50 * 10 ** 18);

        vm.prank(alice);
        assertTrue(token.transfer(bob, 50 * 10 ** 18), "Transfer failed");

        // Test burn event
        uint256 bobBalanceBeforeBurn = token.balanceOf(bob);

        vm.expectEmit(true, true, true, true, address(token));
        emit CheckpointUpdated(address(this), bob, bobBalanceBeforeBurn, bobBalanceBeforeBurn - 10 * 10 ** 18);

        token.burn(bob, 10 * 10 ** 18);
    }

    function testInterfaceSupport() public view {
        console.log("Testing interface support...");

        // Check if contract supports ISMARTHistoricalBalances interface
        bytes4 interfaceId = type(ISMARTHistoricalBalances).interfaceId;

        assertTrue(token.supportsInterface(interfaceId), "Should support ISMARTHistoricalBalances interface");
    }

    function testMintAndBurn() public {
        console.log("Testing mint and burn operations...");

        uint256 time1 = 1000; // Time right after setup

        // Mint more tokens
        vm.warp(1500);
        token.mint(alice, 500 * 10 ** 18);
        uint256 time2 = 1500;

        // Advance time to query
        vm.warp(1600);

        // Check balances after mint
        assertEq(token.balanceOfAt(alice, time2), 1500 * 10 ** 18, "Alice balance after mint");
        assertEq(token.totalSupplyAt(time2), 1500 * 10 ** 18, "Total supply after mint");

        // Historical values should remain unchanged
        assertEq(token.balanceOfAt(alice, time1), 1000 * 10 ** 18, "Alice historical balance before mint");
        assertEq(token.totalSupplyAt(time1), 1000 * 10 ** 18, "Historical total supply before mint");

        // Burn tokens
        vm.warp(1700);
        token.burn(alice, 200 * 10 ** 18);
        uint256 time3 = 1700;

        // Advance time to query
        vm.warp(1800);

        // Check balances after burn
        assertEq(token.balanceOfAt(alice, time3), 1300 * 10 ** 18, "Alice balance after burn");
        assertEq(token.totalSupplyAt(time3), 1300 * 10 ** 18, "Total supply after burn");
    }

    function testComplexScenario() public {
        console.log("Testing complex scenario with multiple users...");

        uint256[] memory checkpoints = new uint256[](10);
        checkpoints[0] = 1000; // Time right after setup

        // Initial state: Alice has 1000 tokens

        // Step 1: Alice transfers to Bob
        vm.warp(1100);
        vm.prank(alice);
        assertTrue(token.transfer(bob, 200 * 10 ** 18), "Transfer failed");
        checkpoints[1] = 1100;

        // Step 2: Bob transfers to Charlie
        vm.warp(1200);
        vm.prank(bob);
        assertTrue(token.transfer(charlie, 50 * 10 ** 18), "Transfer failed");
        checkpoints[2] = 1200;

        // Step 3: Mint new tokens to Charlie
        vm.warp(1300);
        token.mint(charlie, 300 * 10 ** 18);
        checkpoints[3] = 1300;

        // Step 4: Charlie transfers back to Alice
        vm.warp(1400);
        vm.prank(charlie);
        assertTrue(token.transfer(alice, 100 * 10 ** 18), "Transfer failed");
        checkpoints[4] = 1400;

        // Advance time to query historical data
        vm.warp(1500);

        // Verify balances at each checkpoint
        // Checkpoint 0: Initial state
        assertEq(token.balanceOfAt(alice, checkpoints[0]), 1000 * 10 ** 18);
        assertEq(token.balanceOfAt(bob, checkpoints[0]), 0);
        assertEq(token.balanceOfAt(charlie, checkpoints[0]), 0);
        assertEq(token.totalSupplyAt(checkpoints[0]), 1000 * 10 ** 18);

        // Checkpoint 1: After Alice -> Bob transfer
        assertEq(token.balanceOfAt(alice, checkpoints[1]), 800 * 10 ** 18);
        assertEq(token.balanceOfAt(bob, checkpoints[1]), 200 * 10 ** 18);
        assertEq(token.balanceOfAt(charlie, checkpoints[1]), 0);
        assertEq(token.totalSupplyAt(checkpoints[1]), 1000 * 10 ** 18);

        // Checkpoint 2: After Bob -> Charlie transfer
        assertEq(token.balanceOfAt(alice, checkpoints[2]), 800 * 10 ** 18);
        assertEq(token.balanceOfAt(bob, checkpoints[2]), 150 * 10 ** 18);
        assertEq(token.balanceOfAt(charlie, checkpoints[2]), 50 * 10 ** 18);
        assertEq(token.totalSupplyAt(checkpoints[2]), 1000 * 10 ** 18);

        // Checkpoint 3: After minting to Charlie
        assertEq(token.balanceOfAt(alice, checkpoints[3]), 800 * 10 ** 18);
        assertEq(token.balanceOfAt(bob, checkpoints[3]), 150 * 10 ** 18);
        assertEq(token.balanceOfAt(charlie, checkpoints[3]), 350 * 10 ** 18);
        assertEq(token.totalSupplyAt(checkpoints[3]), 1300 * 10 ** 18);

        // Checkpoint 4: After Charlie -> Alice transfer
        assertEq(token.balanceOfAt(alice, checkpoints[4]), 900 * 10 ** 18);
        assertEq(token.balanceOfAt(bob, checkpoints[4]), 150 * 10 ** 18);
        assertEq(token.balanceOfAt(charlie, checkpoints[4]), 250 * 10 ** 18);
        assertEq(token.totalSupplyAt(checkpoints[4]), 1300 * 10 ** 18);
    }
}
