// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModule } from "../../../contracts/smart/modules/AbstractComplianceModule.sol";

/**
 * @title MockedComplianceModule
 * @notice Mock implementation of a compliance module for testing purposes.
 * Allows controlling transfer failures and tracking hook calls and their parameters in a single history array.
 */
contract MockedComplianceModule is AbstractComplianceModule {
    bytes32 public constant override typeId = keccak256("MockedComplianceModule");

    /// @notice Flag to indicate if the next transfer check should fail.
    bool public nextTransferShouldFail;

    // --- Enum for Call Types ---
    enum CallType {
        CREATED,
        DESTROYED,
        TRANSFERRED,
        CAN_TRANSFER,
        VALIDATE_PARAMETERS
    }

    // --- Struct for Unified Call Record ---
    struct CallRecord {
        CallType callType;
        address token; // Used by all except VALIDATE_PARAMETERS
        address from; // Used by DESTROYED, TRANSFERRED, CAN_TRANSFER
        address to; // Used by CREATED, TRANSFERRED, CAN_TRANSFER
        uint256 value; // Used by CREATED, DESTROYED, TRANSFERRED, CAN_TRANSFER
        bytes params; // Used by all
    }

    // --- Call Counters ---
    uint256 public createdCallCount;
    uint256 public destroyedCallCount;
    uint256 public transferredCallCount;
    uint256 public validateParametersCallCount;

    // --- Single Array to Store Call History ---
    CallRecord[] public callHistory;

    /// @notice Constructor for the mocked compliance module.
    /// @dev When a contract inheriting from `MockedComplianceModule` is deployed, this constructor is called.
    /// It calls the constructor of `AbstractComplianceModule` with the `_trustedForwarder` address.
    constructor() AbstractComplianceModule(address(0)) { }

    /// @notice Sets whether the next call to canTransfer should fail.
    /// @param _fail True if the next call should fail, false otherwise.
    function setNextTransferShouldFail(bool _fail) external {
        nextTransferShouldFail = _fail;
    }

    /**
     * @inheritdoc AbstractComplianceModule
     * @dev Tracks the call count and stores parameters in the unified history.
     */
    function transferred(
        address _token,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _params
    )
        external
        virtual
        override
    {
        transferredCallCount++;
        callHistory.push(
            CallRecord({
                callType: CallType.TRANSFERRED, token: _token, from: _from, to: _to, value: _value, params: _params
            })
        );
    }

    /**
     * @inheritdoc AbstractComplianceModule
     * @dev Tracks the call count and stores parameters in the unified history.
     */
    function destroyed(
        address _token,
        address _from,
        uint256 _value,
        bytes calldata _params
    )
        external
        virtual
        override
    {
        destroyedCallCount++;
        callHistory.push(
            CallRecord({
                callType: CallType.DESTROYED, token: _token, from: _from, to: address(0), value: _value, params: _params
            })
        );
    }

    /**
     * @inheritdoc AbstractComplianceModule
     * @dev Tracks the call count and stores parameters in the unified history.
     */
    function created(address _token, address _to, uint256 _value, bytes calldata _params) external virtual override {
        createdCallCount++;
        callHistory.push(
            CallRecord({
                callType: CallType.CREATED, token: _token, from: address(0), to: _to, value: _value, params: _params
            })
        );
    }

    /**
     * @dev Checks the failure flag. If set, reverts. Tracks call count and params in unified history.
     * @notice IMPORTANT: Removed 'view' modifier to allow storing call history (state change).
     */
    function canTransfer(address, address, address, uint256, bytes calldata) external view override {
        if (nextTransferShouldFail) {
            revert ComplianceCheckFailed("Mocked compliance failure");
        }
        // If not failing, do nothing (implicitly passes)
    }

    /**
     * @dev Tracks call count and params in unified history. Empty validation logic.
     * @notice IMPORTANT: Removed 'view' modifier to allow storing call history (state change).
     */
    function validateParameters(bytes calldata _params) external view override {
        // State changes removed to comply with 'view'
        // Do nothing for validation itself
    }

    /**
     * @dev Returns the mock module name.
     */
    function name() external pure override returns (string memory) {
        return "MockedComplianceModule";
    }

    /**
     * @notice Resets all tracking counters, failure flag, and the call history array.
     */
    function reset() external {
        nextTransferShouldFail = false;

        createdCallCount = 0;
        destroyedCallCount = 0;
        transferredCallCount = 0;
        validateParametersCallCount = 0;

        delete callHistory;
    }
}
