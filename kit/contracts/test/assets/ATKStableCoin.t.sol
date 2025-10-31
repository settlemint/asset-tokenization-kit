// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKAssetTest } from "./AbstractATKAssetTest.sol";

import { IATKStableCoin } from "../../contracts/assets/stable-coin/IATKStableCoin.sol";
import { IATKStableCoinFactory } from "../../contracts/assets/stable-coin/IATKStableCoinFactory.sol";
import { ATKStableCoinFactoryImplementation } from
    "../../contracts/assets/stable-coin/ATKStableCoinFactoryImplementation.sol";
import { ATKStableCoinImplementation } from "../../contracts/assets/stable-coin/ATKStableCoinImplementation.sol";
import { ATKAssetRoles } from "../../contracts/assets/ATKAssetRoles.sol";
import { ClaimUtils } from "../../test/utils/ClaimUtils.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { SMARTComplianceModuleParamPair } from
    "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMART } from "../../contracts/smart/interface/ISMART.sol";
import { ISMARTCollateral } from "../../contracts/smart/extensions/collateral/ISMARTCollateral.sol";
import { TestConstants } from "../Constants.sol";

contract ATKStableCoinTest is AbstractATKAssetTest {
    IATKStableCoinFactory public stableCoinFactory;
    IATKStableCoin public stableCoin;

    address public owner;
    address public user1;
    address public user2;
    address public spender;

    uint8 public constant DECIMALS = 8;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** DECIMALS;
    uint48 public constant COLLATERAL_LIVENESS = 7 days;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        // Create identities
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        // Initialize ATK
        setUpATK(owner);

        // Set up the Deposit Factory
        ATKStableCoinFactoryImplementation stableCoinFactoryImpl =
            new ATKStableCoinFactoryImplementation(address(forwarder));
        ATKStableCoinImplementation stableCoinImpl = new ATKStableCoinImplementation(address(forwarder));

        vm.startPrank(platformAdmin);
        stableCoinFactory = IATKStableCoinFactory(
            systemUtils.tokenFactoryRegistry().registerTokenFactory(
                "StableCoin", address(stableCoinFactoryImpl), address(stableCoinImpl)
            )
        );
        vm.stopPrank();

        // Initialize identities
        _setUpIdentity(owner, "Owner");
        _setUpIdentity(user1, "User1");
        _setUpIdentity(user2, "User2");
        _setUpIdentity(spender, "Spender");

        stableCoin = _createStableCoin("StableCoin", "STBL", DECIMALS, new SMARTComplianceModuleParamPair[](0));
        vm.label(address(stableCoin), "StableCoin");
    }

    function _createStableCoin(
        string memory name,
        string memory symbol,
        uint8 decimals,
        SMARTComplianceModuleParamPair[] memory initialModulePairs
    )
        internal
        returns (IATKStableCoin result)
    {
        vm.startPrank(owner);
        address stableCoinAddress = stableCoinFactory.createStableCoin(
            name, symbol, decimals, initialModulePairs, TestConstants.COUNTRY_CODE_US
        );

        result = IATKStableCoin(stableCoinAddress);

        vm.label(stableCoinAddress, "StableCoin");
        vm.stopPrank();

        _grantAllRoles(result.accessManager(), owner, owner);

        vm.prank(owner);
        result.unpause();

        return result;
    }

    function _updateCollateral(address token, address tokenIssuer, uint256 collateralAmount) internal {
        // Use a very large amount and a long expiry
        uint256 farFutureExpiry = block.timestamp + 3650 days; // ~10 years

        vm.startPrank(tokenIssuer);
        _issueCollateralClaim(address(token), tokenIssuer, collateralAmount, farFutureExpiry);
        vm.stopPrank();
    }

    function _mintInitialSupply(address recipient) internal {
        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);
        vm.startPrank(owner);
        stableCoin.mint(recipient, INITIAL_SUPPLY);
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public view {
        assertEq(stableCoin.name(), "StableCoin");
        assertEq(stableCoin.symbol(), "STBL");
        assertEq(stableCoin.decimals(), DECIMALS);
        assertEq(stableCoin.totalSupply(), 0);
        assertTrue(stableCoin.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, owner));
        assertTrue(stableCoin.hasRole(ATKAssetRoles.GOVERNANCE_ROLE, owner));
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; ++i) {
            IATKStableCoin newToken = _createStableCoin(
                string.concat("StableCoin ", Strings.toString(decimalValues[i])),
                string.concat("STBL", Strings.toString(decimalValues[i])),
                decimalValues[i],
                new SMARTComplianceModuleParamPair[](0)
            );
            assertEq(newToken.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);

        vm.expectRevert(abi.encodeWithSelector(ISMART.InvalidDecimals.selector, 19));
        stableCoinFactory.createStableCoin(
            "StableCoin 19", "STBL19", 19, new SMARTComplianceModuleParamPair[](0), TestConstants.COUNTRY_CODE_US
        );
        vm.stopPrank();
    }

    function test_OnlySupplyManagementCanMint() public {
        _mintInitialSupply(user1);

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY);
        assertEq(stableCoin.totalSupply(), INITIAL_SUPPLY);

        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY + 100);

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE
            )
        );
        stableCoin.mint(user1, 100);
        vm.stopPrank();
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        ISMARTTokenAccessManager(stableCoin.accessManager()).grantRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1);
        assertTrue(stableCoin.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1));

        ISMARTTokenAccessManager(stableCoin.accessManager()).revokeRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1);
        assertFalse(stableCoin.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1));
        vm.stopPrank();
    }

    // ERC20Burnable tests
    function test_Burn() public {
        _mintInitialSupply(user1);

        vm.startPrank(owner);
        stableCoin.burn(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    // ERC20Pausable tests
    function test_OnlyAdminCanPause() public {
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, ATKAssetRoles.EMERGENCY_ROLE
            )
        );
        stableCoin.pause();
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.pause();
        vm.stopPrank();

        assertTrue(stableCoin.paused());
    }

    function test_OnlyTrustedIssuerCanUpdateCollateral() public {
        uint256 collateralAmount = 1_000_000;

        // Setup an untrusted issuer
        uint256 untrustedIssuerPK = 0xBAD155;
        address untrustedIssuerWallet = vm.addr(untrustedIssuerPK);
        vm.label(untrustedIssuerWallet, "Untrusted Issuer Wallet");
        ClaimUtils untrustedClaimUtils = _createClaimUtilsForIssuer(untrustedIssuerWallet, untrustedIssuerPK);
        _createIdentity(untrustedIssuerWallet);

        uint256 farFutureExpiry = block.timestamp + 3650 days; // ~10 years

        vm.startPrank(untrustedIssuerWallet);
        untrustedClaimUtils.issueCollateralClaim(address(stableCoin), owner, collateralAmount, farFutureExpiry);
        vm.stopPrank();

        // Declare variables the first time
        (uint256 amount, address claimIssuer, uint256 timestamp) = stableCoin.findValidCollateralClaim();
        assertEq(amount, 0); // Check initial state (untrusted issuer)

        // Expect mint to revert due to insufficient collateral
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(ISMARTCollateral.InsufficientCollateral.selector, 100, 0)); // Assuming
            // mint amount is 100
        stableCoin.mint(user1, 100);
        vm.stopPrank();

        // Issue claim from the trusted issuer (owner)
        _issueCollateralClaim(address(stableCoin), owner, collateralAmount, farFutureExpiry);

        // Assign new values to existing variables (no type declaration)
        (amount, claimIssuer, timestamp) = stableCoin.findValidCollateralClaim();
        assertEq(amount, collateralAmount); // Check updated state (trusted issuer)

        vm.startPrank(owner);
        stableCoin.mint(user1, 100);
        vm.stopPrank();
    }

    // ERC20Custodian tests
    function test_OnlyUserManagementCanFreeze() public {
        _updateCollateral(address(stableCoin), address(owner), INITIAL_SUPPLY);

        vm.startPrank(owner);
        stableCoin.mint(user1, 100);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, ATKAssetRoles.CUSTODIAN_ROLE
            )
        );
        stableCoin.freezePartialTokens(user1, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.freezePartialTokens(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.getFrozenTokens(user1), 100);

        vm.startPrank(user1);
        vm.expectRevert();
        /// forge-lint: disable-next-line(erc20-unchecked-transfer)
        stableCoin.transfer(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.unfreezePartialTokens(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.getFrozenTokens(user1), 0);
    }

    // Transfer and approval tests
    function test_TransferAndApproval() public {
        _mintInitialSupply(user1);

        vm.prank(user1);
        stableCoin.approve(spender, 100);
        assertEq(stableCoin.allowance(user1, spender), 100);

        vm.prank(spender);
        assertTrue(stableCoin.transferFrom(user1, user2, 50), "TransferFrom failed");
        assertEq(stableCoin.balanceOf(user2), 50);
        assertEq(stableCoin.allowance(user1, spender), 50);
    }

    function test_StableCoinForcedTransfer() public {
        _mintInitialSupply(user1);

        vm.startPrank(owner);
        stableCoin.forcedTransfer(user1, user2, INITIAL_SUPPLY);
        vm.stopPrank();

        assertEq(stableCoin.balanceOf(user1), 0);
        assertEq(stableCoin.balanceOf(user2), INITIAL_SUPPLY);
    }

    function test_onlySupplyManagementCanForceTransfer() public {
        _mintInitialSupply(user1);

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, ATKAssetRoles.CUSTODIAN_ROLE
            )
        );
        stableCoin.forcedTransfer(user1, user2, INITIAL_SUPPLY);
        vm.stopPrank();
    }
}
