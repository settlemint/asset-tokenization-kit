// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKAssetTest } from "./AbstractATKAssetTest.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IATKFund } from "../../contracts/assets/fund/IATKFund.sol";
import { IATKFundFactory } from "../../contracts/assets/fund/IATKFundFactory.sol";
import { ATKFundFactoryImplementation } from "../../contracts/assets/fund/ATKFundFactoryImplementation.sol";
import { ATKFundImplementation } from "../../contracts/assets/fund/ATKFundImplementation.sol";

import { SMARTComplianceModuleParamPair } from
    "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ATKAssetRoles } from "../../contracts/assets/ATKAssetRoles.sol";
import { ISMART } from "../../contracts/smart/interface/ISMART.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ISMARTPausable } from "../../contracts/smart/extensions/pausable/ISMARTPausable.sol";
import { TestConstants } from "../Constants.sol";

contract ATKFundTest is AbstractATKAssetTest {
    IATKFundFactory public fundFactory;
    IATKFund public fund;

    address public owner;
    address public investor1;
    address public investor2;

    // Constants for fund setup
    string constant NAME = "Test Fund";
    string constant SYMBOL = "TFUND";
    uint8 constant DECIMALS = 18;
    uint16 constant MANAGEMENT_FEE_BPS = 200; // 2%

    // Test constants
    uint256 constant INITIAL_SUPPLY = 1000 ether;
    uint256 constant INVESTMENT_AMOUNT = 100 ether;

    event ManagementFeeCollected(uint256 amount, uint256 timestamp);
    event PerformanceFeeCollected(uint256 amount, uint256 timestamp);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount, address indexed sender);

    function setUp() public {
        // Create identities
        owner = makeAddr("owner");
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");

        // Initialize ATK
        setUpATK(owner);

        // Set up the Fund Factory
        ATKFundFactoryImplementation fundFactoryImpl = new ATKFundFactoryImplementation(address(forwarder));
        ATKFundImplementation fundImpl = new ATKFundImplementation(address(forwarder));

        vm.startPrank(platformAdmin);
        fundFactory = IATKFundFactory(
            systemUtils.tokenFactoryRegistry().registerTokenFactory("Fund", address(fundFactoryImpl), address(fundImpl))
        );
        vm.stopPrank();

        // Initialize identities
        _setUpIdentity(owner, "Owner");
        _setUpIdentity(investor1, "Investor 1");
        _setUpIdentity(investor2, "Investor 2");

        fund = _createFundAndMint(NAME, SYMBOL, DECIMALS, MANAGEMENT_FEE_BPS, new SMARTComplianceModuleParamPair[](0));
        vm.label(address(fund), "Fund");
    }

    function _createFundAndMint(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint16 managementFeeBps_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        internal
        returns (IATKFund result)
    {
        vm.startPrank(owner);
        address fundAddress = fundFactory.createFund(
            name_, symbol_, decimals_, managementFeeBps_, initialModulePairs_, TestConstants.COUNTRY_CODE_US
        );

        result = IATKFund(fundAddress);

        vm.label(fundAddress, "Fund");
        vm.stopPrank();

        _grantAllRoles(result.accessManager(), owner, owner);

        vm.prank(owner);
        result.unpause();

        vm.prank(owner);
        result.mint(owner, INITIAL_SUPPLY);

        return result;
    }

    function test_InitialState() public view {
        assertEq(fund.name(), NAME);
        assertEq(fund.symbol(), SYMBOL);
        assertEq(fund.decimals(), DECIMALS);
        assertTrue(fund.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, owner));
        assertTrue(fund.hasRole(ATKAssetRoles.GOVERNANCE_ROLE, owner));
    }

    function test_Mint() public {
        vm.startPrank(owner);
        fund.mint(investor1, INVESTMENT_AMOUNT);
        vm.stopPrank();

        assertEq(fund.balanceOf(investor1), INVESTMENT_AMOUNT);
    }

    function test_CollectManagementFee() public {
        // Wait for one year
        vm.warp(block.timestamp + 365 days);

        uint256 initialOwnerBalance = fund.balanceOf(owner);

        vm.startPrank(owner);
        uint256 fee = fund.collectManagementFee();
        vm.stopPrank();

        // Expected fee = AUM * fee_rate * time_elapsed / (100% * 1 year)
        uint256 expectedFee = (INITIAL_SUPPLY * MANAGEMENT_FEE_BPS * 365 days) / (10_000 * 365 days);
        assertEq(fee, expectedFee);
        assertEq(fund.balanceOf(owner) - initialOwnerBalance, expectedFee);
    }

    function test_RecoverERC20() public {
        address mockToken = makeAddr("mockToken");
        uint256 withdrawAmount = 100 ether;

        // Setup mock token
        vm.mockCall(
            mockToken, abi.encodeWithSelector(IERC20.balanceOf.selector, address(fund)), abi.encode(withdrawAmount)
        );
        vm.mockCall(
            mockToken, abi.encodeWithSelector(IERC20.transfer.selector, investor1, withdrawAmount), abi.encode(true)
        );

        vm.startPrank(owner);
        vm.expectEmit(true, true, true, true);
        emit ISMART.ERC20TokenRecovered(owner, mockToken, investor1, withdrawAmount);
        fund.recoverERC20(mockToken, investor1, withdrawAmount);
        vm.stopPrank();
    }

    function test_PauseUnpause() public {
        vm.startPrank(owner);

        // Mint some tokens first
        fund.mint(owner, INVESTMENT_AMOUNT);

        // Pause the contract
        fund.pause();
        assertTrue(fund.paused());

        // Try to transfer while paused - should revert with EnforcedPause error
        vm.expectRevert(abi.encodeWithSelector(ISMARTPausable.TokenPaused.selector));
        /// forge-lint: disable-next-line(erc20-unchecked-transfer)
        fund.transfer(investor1, INVESTMENT_AMOUNT);

        // Unpause
        fund.unpause();
        assertFalse(fund.paused());

        // Transfer should now succeed
        assertTrue(fund.transfer(investor1, INVESTMENT_AMOUNT), "Transfer failed");
        assertEq(fund.balanceOf(investor1), INVESTMENT_AMOUNT);

        vm.stopPrank();
    }

    function test_FundForceTransfer() public {
        vm.startPrank(owner);
        fund.mint(investor1, INVESTMENT_AMOUNT);
        vm.stopPrank();

        vm.startPrank(owner);
        fund.forcedTransfer(investor1, investor2, INVESTMENT_AMOUNT);
        vm.stopPrank();

        assertEq(fund.balanceOf(investor1), 0);
        assertEq(fund.balanceOf(investor2), INVESTMENT_AMOUNT);
    }

    function test_onlySupplyManagementCanForceTransfer() public {
        vm.startPrank(owner);
        fund.mint(investor1, INVESTMENT_AMOUNT);
        vm.stopPrank();

        vm.startPrank(investor2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, investor2, ATKAssetRoles.CUSTODIAN_ROLE
            )
        );
        fund.forcedTransfer(investor1, investor2, INVESTMENT_AMOUNT);
        vm.stopPrank();
    }
}
