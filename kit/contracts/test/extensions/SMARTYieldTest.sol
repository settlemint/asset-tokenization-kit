// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { SMARTYieldUnitTest } from "./SMARTYieldUnitTest.sol";
import { SMARTYieldIntegrationTest } from "./SMARTYieldIntegrationTest.sol";

/// @title SMART Yield Test Suite
/// @notice Main test contract that combines unit and integration tests for SMART Yield functionality
/// @dev This contract inherits from both unit and integration test contracts to provide
///      a comprehensive test suite for the SMART Yield extension
abstract contract SMARTYieldTest is SMARTYieldUnitTest, SMARTYieldIntegrationTest {
// All test functions are inherited from SMARTYieldUnitTest and SMARTYieldIntegrationTest
// This contract serves as the main entry point for running all yield-related tests
}
