// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ComplianceModuleTest } from "./ComplianceModuleTest.t.sol";
import { CountryBlockListComplianceModule } from "../../../contracts/smart/modules/CountryBlockListComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract CountryBlockListComplianceModuleTest is ComplianceModuleTest {
    CountryBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new CountryBlockListComplianceModule(address(0));
        module.grantRole(GLOBAL_LIST_MANAGER_ROLE, address(this));
    }

    function test_InitialState() public virtual {
        assertEq(module.name(), "Country BlockList Compliance Module");
    }

    function test_SetGlobalBlockedCountries() public {
        uint16[] memory countriesToBlock = new uint16[](2);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US;
        countriesToBlock[1] = TestConstants.COUNTRY_CODE_JP;

        module.setGlobalBlockedCountries(countriesToBlock, true);

        assertTrue(module.isGloballyBlocked(TestConstants.COUNTRY_CODE_US));
        assertTrue(module.isGloballyBlocked(TestConstants.COUNTRY_CODE_JP));

        uint16[] memory blockedCountries = module.getGlobalBlockedCountries();
        assertEq(blockedCountries.length, 2);
        assertEq(blockedCountries[0], TestConstants.COUNTRY_CODE_US);
        assertEq(blockedCountries[1], TestConstants.COUNTRY_CODE_JP);
    }

    function test_UnsetGlobalBlockedCountries() public {
        uint16[] memory countriesToBlock = new uint16[](1);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US;

        module.setGlobalBlockedCountries(countriesToBlock, true);
        assertTrue(module.isGloballyBlocked(TestConstants.COUNTRY_CODE_US));

        module.setGlobalBlockedCountries(countriesToBlock, false);
        assertFalse(module.isGloballyBlocked(TestConstants.COUNTRY_CODE_US));
    }

    function testFail_SetGlobalBlockedCountries_NotAdmin() public {
        vm.prank(user1);
        uint16[] memory countriesToBlock = new uint16[](1);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US;
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), user1, GLOBAL_LIST_MANAGER_ROLE
            )
        );
        module.setGlobalBlockedCountries(countriesToBlock, true);
    }

    function test_CanTransfer_NoIdentity() public virtual {
        bytes memory params = abi.encode(new uint16[](0));
        module.canTransfer(address(smartToken), user1, user3, 100, params);
        // Should not revert
    }

    function test_CanTransfer_NotBlocked() public virtual {
        bytes memory params = abi.encode(new uint16[](0));
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
        // Should not revert
    }

    function testRevert_CanTransfer_GloballyBlocked() public {
        uint16[] memory countriesToBlock = new uint16[](1);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US; // user1 is from US
        module.setGlobalBlockedCountries(countriesToBlock, true);

        bytes memory params = abi.encode(new uint16[](0));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country globally blocked"
            )
        );
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
    }

    function testRevert_CanTransfer_TokenBlocked() public {
        uint16[] memory additionalBlocked = new uint16[](1);
        additionalBlocked[0] = TestConstants.COUNTRY_CODE_BE; // user2 is from Belgium
        bytes memory params = abi.encode(additionalBlocked);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country blocked for token"
            )
        );
        module.canTransfer(address(smartToken), address(this), user2, 100, params);
    }

    function test_Integration_TokenTransfer_GloballyBlocked() public {
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), abi.encode(new uint16[](0)));
        vm.stopPrank();

        uint16[] memory countriesToBlock = new uint16[](1);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US; // user1
        module.setGlobalBlockedCountries(countriesToBlock, true);

        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country globally blocked"
            )
        );
        smartToken.transfer(user1, 100);
    }
}
