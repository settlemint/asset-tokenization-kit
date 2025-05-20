// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKSystemFactory } from "../contracts/ATKSystemFactory.sol";

contract ATKSystemFactoryTest is Test {
    ATKSystemFactory public atkSystemFactory;

    function setUp() public {
        address complianceImplementation_ = address(0x1);
        address identityRegistryImplementation_ = address(0x2);
        address identityRegistryStorageImplementation_ = address(0x3);
        address trustedIssuersRegistryImplementation_ = address(0x4);
        address identityFactoryImplementation_ = address(0x5);
        address identityImplementation_ = address(0x6);
        address tokenIdentityImplementation_ = address(0x7);
        address forwarder_ = address(0x8);

        atkSystemFactory = new ATKSystemFactory(
            complianceImplementation_,
            identityRegistryImplementation_,
            identityRegistryStorageImplementation_,
            trustedIssuersRegistryImplementation_,
            identityFactoryImplementation_,
            identityImplementation_,
            tokenIdentityImplementation_,
            forwarder_
        );
    }

    function testExample() public {
        assertTrue(true);
    }
}
