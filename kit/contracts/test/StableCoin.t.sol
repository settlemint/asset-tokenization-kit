// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { StableCoin } from "../contracts/StableCoin.sol";

contract StableCoinTest is Test {
    StableCoin public stableCoin;
    address public owner;
    address public user1;
    address public user2;
    address public spender;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;
    uint48 public constant COLLATERAL_LIVENESS = 7 days;
    uint8 public constant DECIMALS = 8;
    string public constant VALID_ISIN = "US0378331005";

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        vm.startPrank(owner);
        stableCoin = new StableCoin("StableCoin", "STBL", DECIMALS, owner, VALID_ISIN, COLLATERAL_LIVENESS);
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public view {
        assertEq(stableCoin.name(), "StableCoin");
        assertEq(stableCoin.symbol(), "STBL");
        assertEq(stableCoin.decimals(), DECIMALS);
        assertEq(stableCoin.totalSupply(), 0);
        assertEq(stableCoin.isin(), VALID_ISIN);
        assertTrue(stableCoin.hasRole(stableCoin.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(stableCoin.hasRole(stableCoin.SUPPLY_MANAGEMENT_ROLE(), owner));
        assertTrue(stableCoin.hasRole(stableCoin.USER_MANAGEMENT_ROLE(), owner));
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; i++) {
            vm.startPrank(owner);
            StableCoin newToken =
                new StableCoin("StableCoin", "STBL", decimalValues[i], owner, VALID_ISIN, COLLATERAL_LIVENESS);
            vm.stopPrank();
            assertEq(newToken.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(StableCoin.InvalidDecimals.selector, 19));
        new StableCoin("StableCoin", "STBL", 19, owner, VALID_ISIN, COLLATERAL_LIVENESS);
        vm.stopPrank();
    }

    function test_OptionalISIN() public {
        vm.startPrank(owner);

        // Test with empty ISIN (should be valid for StableCoin)
        StableCoin emptyIsinToken = new StableCoin("StableCoin", "STBL", DECIMALS, owner, "", COLLATERAL_LIVENESS);
        assertEq(emptyIsinToken.isin(), "");

        // Test with valid ISIN
        StableCoin validIsinToken =
            new StableCoin("StableCoin", "STBL", DECIMALS, owner, VALID_ISIN, COLLATERAL_LIVENESS);
        assertEq(validIsinToken.isin(), VALID_ISIN);

        // Test with invalid ISIN length
        vm.expectRevert(abi.encodeWithSelector(StableCoin.InvalidISIN.selector));
        new StableCoin(
            "StableCoin",
            "STBL",
            DECIMALS,
            owner,
            "US03783310", // too short
            COLLATERAL_LIVENESS
        );

        vm.expectRevert(abi.encodeWithSelector(StableCoin.InvalidISIN.selector));
        new StableCoin(
            "StableCoin",
            "STBL",
            DECIMALS,
            owner,
            "US0378331005XX", // too long
            COLLATERAL_LIVENESS
        );

        vm.stopPrank();
    }

    function test_OnlySupplyManagementCanMint() public {
        vm.startPrank(owner);
        stableCoin.updateCollateral(INITIAL_SUPPLY);
        stableCoin.mint(user1, INITIAL_SUPPLY);
        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY);
        assertEq(stableCoin.totalSupply(), INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, stableCoin.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        stableCoin.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        stableCoin.grantRole(stableCoin.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertTrue(stableCoin.hasRole(stableCoin.SUPPLY_MANAGEMENT_ROLE(), user1));

        stableCoin.revokeRole(stableCoin.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertFalse(stableCoin.hasRole(stableCoin.SUPPLY_MANAGEMENT_ROLE(), user1));
        vm.stopPrank();
    }

    // ERC20Burnable tests
    function test_Burn() public {
        vm.startPrank(owner);
        stableCoin.updateCollateral(INITIAL_SUPPLY);
        stableCoin.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        stableCoin.burn(100);
        vm.stopPrank();

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    function test_BurnFrom() public {
        vm.startPrank(owner);
        stableCoin.updateCollateral(INITIAL_SUPPLY);
        stableCoin.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        stableCoin.approve(spender, 100);
        vm.stopPrank();

        vm.startPrank(spender);
        stableCoin.burnFrom(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    // ERC20Pausable tests
    function test_OnlyAdminCanPause() public {
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, stableCoin.DEFAULT_ADMIN_ROLE()
            )
        );
        stableCoin.pause();
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.pause();
        vm.stopPrank();

        assertTrue(stableCoin.paused());
    }

    // ERC20Blocklist tests
    function test_OnlyUserManagementCanBlock() public {
        vm.startPrank(owner);
        stableCoin.updateCollateral(INITIAL_SUPPLY);
        stableCoin.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user2, stableCoin.USER_MANAGEMENT_ROLE()
            )
        );
        stableCoin.blockUser(user1);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.blockUser(user1);
        vm.stopPrank();

        assertTrue(stableCoin.blocked(user1));

        vm.startPrank(user1);
        vm.expectRevert();
        stableCoin.transfer(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.unblockUser(user1);
        vm.stopPrank();

        assertFalse(stableCoin.blocked(user1));

        vm.startPrank(user1);
        stableCoin.transfer(user2, 100);
        vm.stopPrank();

        assertEq(stableCoin.balanceOf(user2), 100);
    }

    // ERC20Collateral tests
    function test_OnlyAdminCanUpdateCollateral() public {
        uint256 collateralAmount = 1_000_000;

        bytes32 role = stableCoin.SUPPLY_MANAGEMENT_ROLE();
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("AccessControlUnauthorizedAccount(address,bytes32)", user1, role));
        stableCoin.updateCollateral(collateralAmount);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.updateCollateral(collateralAmount);
        vm.stopPrank();

        (uint256 amount, uint48 timestamp) = stableCoin.collateral();
        assertEq(amount, collateralAmount);
        assertEq(timestamp, uint48(block.timestamp));
    }

    // ERC20Custodian tests
    function test_OnlyUserManagementCanFreeze() public {
        vm.startPrank(owner);
        stableCoin.updateCollateral(INITIAL_SUPPLY);
        stableCoin.mint(user1, 100);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(abi.encodeWithSignature("ERC20NotCustodian()"));
        stableCoin.freeze(user1, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.freeze(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.frozen(user1), 100);

        vm.startPrank(user1);
        vm.expectRevert();
        stableCoin.transfer(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        stableCoin.unfreeze(user1, 100);
        vm.stopPrank();

        assertEq(stableCoin.frozen(user1), 0);
    }

    // ERC20Permit tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);

        vm.startPrank(owner);
        stableCoin.updateCollateral(INITIAL_SUPPLY);
        stableCoin.mint(signer, INITIAL_SUPPLY);
        vm.stopPrank();

        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = stableCoin.nonces(signer);

        bytes32 DOMAIN_SEPARATOR = stableCoin.DOMAIN_SEPARATOR();

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            privateKey,
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            keccak256(
                                "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                            ),
                            signer,
                            spender,
                            100,
                            nonce,
                            deadline
                        )
                    )
                )
            )
        );

        stableCoin.permit(signer, spender, 100, deadline, v, r, s);
        assertEq(stableCoin.allowance(signer, spender), 100);
    }

    // Transfer and approval tests
    function test_TransferAndApproval() public {
        vm.startPrank(owner);
        stableCoin.updateCollateral(INITIAL_SUPPLY);
        stableCoin.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.prank(user1);
        stableCoin.approve(spender, 100);
        assertEq(stableCoin.allowance(user1, spender), 100);

        vm.prank(spender);
        stableCoin.transferFrom(user1, user2, 50);
        assertEq(stableCoin.balanceOf(user2), 50);
        assertEq(stableCoin.allowance(user1, spender), 50);
    }

    receive() external payable { }
}
