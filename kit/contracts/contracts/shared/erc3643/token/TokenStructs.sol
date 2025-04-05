// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

struct TokenRoles {
    bool disableMint;
    bool disableBurn;
    bool disablePartialFreeze;
    bool disableAddressFreeze;
    bool disableRecovery;
    bool disableForceTransfer;
    bool disablePause;
}
