// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ExpressionType Enum
/// @notice Defines the types of nodes in a logical expression for claim verification
/// @dev Used for postfix (Reverse Polish Notation) expression evaluation in compliance rules.
///      This enables flexible logical combinations of claim requirements beyond simple AND operations.
enum ExpressionType {
    /// @notice Represents a claim topic ID that must be verified against the user's identity
    TOPIC,
    /// @notice Logical AND operation - requires both operands to be true
    AND,
    /// @notice Logical OR operation - requires at least one operand to be true
    OR,
    /// @notice Logical NOT operation - inverts the truth value of the operand
    /// @notice Might not be very relevant, because people manage their own identity, so they can remove claims
    NOT
}

/// @title ExpressionNode Struct
/// @notice Represents a single node in a logical expression for claim verification
/// @dev Used to build postfix expressions for flexible compliance rules.
///      Postfix notation eliminates the need for parentheses and operator precedence rules,
///      making evaluation simpler and more reliable.
///
///      Example: "(KYC AND AML) OR VAULT" becomes the postfix expression:
///      [TOPIC(KYC), TOPIC(AML), AND, TOPIC(VAULT), OR]
struct ExpressionNode {
    /// @notice The type of this node in the expression
    /// @dev Determines how this node should be processed during evaluation
    ExpressionType nodeType;
    /// @notice The value associated with this node
    /// @dev Only used for TOPIC nodes, where it contains the claim topic ID.
    ///      For operator nodes (AND, OR, NOT), this field is ignored and should be set to 0.
    uint256 value;
}
