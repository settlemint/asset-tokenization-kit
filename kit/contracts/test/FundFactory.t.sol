// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { FundFactory } from "../contracts/FundFactory.sol";
import { Fund } from "../contracts/Fund.sol";

contract FundFactoryTest is Test {
    FundFactory public factory;
    address public owner;
    address public user1;
    address public user2;

    // Constants for fund creation
    string constant NAME = "Test Fund";
    string constant SYMBOL = "TFUND";
    uint8 constant DECIMALS = 18;
    string constant ISIN = "US0378331005";
    uint256 constant MANAGEMENT_FEE_BPS = 200; // 2%
    uint256 constant HURDLE_RATE_BPS = 1000; // 10%
    string constant FUND_CLASS = "Hedge Fund";
    string constant FUND_CATEGORY = "Long/Short Equity";

    event FundCreated(
        address indexed token,
        string name,
        string symbol,
        uint8 decimals,
        address indexed owner,
        string isin,
        string fundClass,
        string fundCategory,
        uint256 managementFeeBps,
        uint256 hurdleRateBps,
        uint256 tokenCount
    );

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.startPrank(owner);
        factory = new FundFactory();
        vm.stopPrank();
    }

    function test_CreateFund() public {
        vm.startPrank(owner);

        address predictedAddress = factory.predictAddress(
            NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS, HURDLE_RATE_BPS
        );

        vm.expectEmit(true, true, true, true);
        emit FundCreated(
            predictedAddress,
            NAME,
            SYMBOL,
            DECIMALS,
            owner,
            ISIN,
            FUND_CLASS,
            FUND_CATEGORY,
            MANAGEMENT_FEE_BPS,
            HURDLE_RATE_BPS,
            1
        );

        address fundAddress =
            factory.create(NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS, HURDLE_RATE_BPS);

        assertEq(fundAddress, predictedAddress);
        assertTrue(factory.isFactoryFund(fundAddress));

        Fund fund = Fund(fundAddress);
        assertEq(fund.name(), NAME);
        assertEq(fund.symbol(), SYMBOL);
        assertEq(fund.decimals(), DECIMALS);
        assertEq(fund.isin(), ISIN);
        assertEq(fund.fundClass(), FUND_CLASS);
        assertEq(fund.fundCategory(), FUND_CATEGORY);
        assertTrue(fund.hasRole(fund.DEFAULT_ADMIN_ROLE(), owner));

        vm.stopPrank();
    }

    function test_CreateFund_DuplicateAddress() public {
        vm.startPrank(owner);

        // Create first fund
        factory.create(NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS, HURDLE_RATE_BPS);

        // Try to create duplicate fund
        vm.expectRevert(FundFactory.AddressAlreadyDeployed.selector);
        factory.create(NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS, HURDLE_RATE_BPS);

        vm.stopPrank();
    }

    function test_GetTokensInRange() public {
        vm.startPrank(owner);

        // Create multiple funds
        address[] memory funds = new address[](3);
        for (uint256 i = 0; i < 3; i++) {
            funds[i] = factory.create(
                NAME,
                string(abi.encodePacked(SYMBOL, unicode"_", vm.toString(i + 1))),
                DECIMALS,
                ISIN,
                FUND_CLASS,
                FUND_CATEGORY,
                MANAGEMENT_FEE_BPS,
                HURDLE_RATE_BPS
            );
        }

        // Get subset of funds
        Fund[] memory subset = factory.getTokensInRange(1, 3);
        assertEq(subset.length, 2);
        assertEq(address(subset[0]), funds[1]);
        assertEq(address(subset[1]), funds[2]);

        // Test invalid range
        vm.expectRevert("Invalid range");
        factory.getTokensInRange(2, 1);

        vm.expectRevert("Invalid range");
        factory.getTokensInRange(0, 4);

        vm.stopPrank();
    }

    function test_PredictAddress() public {
        vm.startPrank(owner);

        address predicted = factory.predictAddress(
            NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS, HURDLE_RATE_BPS
        );

        address actual =
            factory.create(NAME, SYMBOL, DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS, HURDLE_RATE_BPS);

        assertEq(actual, predicted);

        // Predict address with different parameters
        address predicted2 = factory.predictAddress(
            "Different Fund", "DFUND", DECIMALS, ISIN, FUND_CLASS, FUND_CATEGORY, MANAGEMENT_FEE_BPS, HURDLE_RATE_BPS
        );

        assertTrue(predicted2 != predicted);

        vm.stopPrank();
    }
}
