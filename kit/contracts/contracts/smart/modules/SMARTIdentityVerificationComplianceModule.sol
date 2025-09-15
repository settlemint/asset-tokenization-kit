// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";
import { ISMART } from "../interface/ISMART.sol";
import { ExpressionNode, ExpressionType } from "../interface/structs/ExpressionNode.sol";

/// @title Identity Verification Module
/// @author SettleMint
/// @notice This module is used to verify the identity of an investor.
/// @dev This module is used to verify the identity of an investor.
contract SMARTIdentityVerificationComplianceModule is AbstractComplianceModule {
    // solhint-disable-next-line const-name-snakecase, use-natspec
    bytes32 public constant override typeId = keccak256("SMARTIdentityVerificationComplianceModule");

    /// @notice Reverted when a token operation (like transfer or mint) is attempted, but the recipient
    ///         (or potentially sender, depending on the operation) does not meet the required identity verification
    /// status.
    /// @dev Verification status is typically checked against the `ISMARTIdentityRegistry` and the token's
    /// `requiredClaimTopics`.
    ///      For example, a recipient might need to have specific claims (like KYC) issued by trusted parties.
    error RecipientNotVerified();

    /// @notice Reverted when an empty expression array is provided
    error EmptyExpressionNotAllowed();

    /// @notice Reverted when a topic ID of zero is used in an expression
    error InvalidTopicIdZeroNotAllowed();

    /// @notice Reverted when a NOT operation is used without sufficient operands
    error NotOperationRequiresOneOperand();

    /// @notice Reverted when an AND/OR operation is used without sufficient operands
    error AndOrOperationRequiresTwoOperands();

    /// @notice Reverted when an unknown expression type is encountered
    error UnknownExpressionType();

    /// @notice Reverted when an expression doesn't evaluate to exactly one result
    error InvalidExpressionMustEvaluateToOneResult();

    // --- Constructor ---
    /// @notice Constructor for the `IdentityVerificationModule`.
    /// @dev When a contract inheriting from `IdentityVerificationModule` is deployed, this constructor is called.
    /// @param trustedForwarder_ Address of the trusted forwarder for meta transactions
    constructor(address trustedForwarder_) AbstractComplianceModule(trustedForwarder_) { }

    // --- Functions ---

    /// @notice Checks if a transfer is compliant based on the receiver's identity verification status
    /// @param token The token contract address
    /// @param _to The receiver address whose identity verification is being checked
    /// @param _params Encoded array of required claim topics that the receiver must have
    // solhint-disable-next-line use-natspec
    function canTransfer(
        address token,
        address, /* _from - unused */
        address _to,
        uint256, /* _value - unused */
        bytes calldata _params
    )
        external
        view
        virtual
        override
    {
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(ISMART(token).identityRegistry());
        ExpressionNode[] memory expression;
        if (_params.length == 0) {
            expression = new ExpressionNode[](0);
        } else {
            expression = abi.decode(_params, (ExpressionNode[]));
        }

        if (!identityRegistry.isVerified(_to, expression)) {
            revert RecipientNotVerified();
        }
    }

    // --- Parameter Validation --- (Standard for Country Modules)

    /// @notice Validates that the provided parameters are properly formatted
    /// @param _params The parameters to validate, expected to be ABI-encoded uint256 array
    function validateParameters(bytes calldata _params) public view virtual override {
        if (_params.length == 0) {
            return;
        }
        ExpressionNode[] memory expression = abi.decode(_params, (ExpressionNode[]));
        _validateExpressionStructure(expression);
    }

    /// @notice Validates that an expression has a proper structure for postfix evaluation
    /// @dev Validates that an expression has a proper structure for postfix evaluation
    /// @param expression The expression to validate
    function _validateExpressionStructure(ExpressionNode[] memory expression) internal pure {
        if (expression.length == 0) {
            return;
        }

        int256 stackBalance = 0;

        for (uint256 i = 0; i < expression.length; ++i) {
            ExpressionNode memory node = expression[i];

            if (node.nodeType == ExpressionType.TOPIC) {
                // TOPIC nodes add one item to the stack
                ++stackBalance;
                // Validate that topic ID is not zero
                if (node.value == 0) {
                    revert InvalidTopicIdZeroNotAllowed();
                }
            } else if (node.nodeType == ExpressionType.NOT) {
                // NOT requires one operand and produces one result (no net change)
                if (stackBalance < 1) {
                    revert NotOperationRequiresOneOperand();
                }
                // Stack balance remains unchanged: -1 + 1 = 0
            } else if (node.nodeType == ExpressionType.AND || node.nodeType == ExpressionType.OR) {
                // AND/OR require two operands and produce one result (net -1)
                if (stackBalance < 2) {
                    revert AndOrOperationRequiresTwoOperands();
                }
                --stackBalance; // Two operands consumed, one result produced
            } else {
                revert UnknownExpressionType();
            }
        }

        // Valid postfix expression should leave exactly one value on the stack
        if (stackBalance != 1) {
            revert InvalidExpressionMustEvaluateToOneResult();
        }
    }

    /// @inheritdoc AbstractComplianceModule
    function name() external pure override returns (string memory) {
        return "Identity Verification Module";
    }
}
