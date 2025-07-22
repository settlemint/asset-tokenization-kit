// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title TestConstants
 * @notice Defines constants used across the SMART protocol test suite.
 */
library TestConstants {
    // Signature Schemes (ERC735)
    uint256 public constant ECDSA_TYPE = 1;

    // Country Codes (ISO 3166-1 numeric)
    uint16 public constant COUNTRY_CODE_BE = 56;
    uint16 public constant COUNTRY_CODE_JP = 392;
    uint16 public constant COUNTRY_CODE_US = 840;
}
