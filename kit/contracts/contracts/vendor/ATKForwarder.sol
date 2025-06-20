// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC2771Forwarder } from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

/// @title ATKForwarder
/// @author SettleMint
/// @notice This contract implements a meta-transaction forwarder based on the ERC-2771 standard.
/// @dev It allows users to interact with other contracts without needing to pay for gas themselves.
/// Instead, a third-party (the forwarder or relayer) can submit the transaction on their behalf,
/// and the target contract can retrieve the original sender's address using `_msgSender()`.
/// This contract inherits from OpenZeppelin's `ERC2771Forwarder`, providing a standard and secure
/// implementation. The name "ATKForwarder" is used to identify this specific forwarder within
/// the ATK token ecosystem.
contract ATKForwarder is ERC2771Forwarder {
    /// @notice Constructor for the ATKForwarder contract.
    /// @dev Initializes the ERC2771Forwarder with a specific name for this forwarder instance.
    /// The name "ATKForwarder" helps in identifying this forwarder, especially when multiple
    /// forwarders might exist in a network.
    constructor() ERC2771Forwarder("ATKForwarder") { }
}
