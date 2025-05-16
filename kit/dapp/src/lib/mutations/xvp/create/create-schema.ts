import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating asset flow information
 *
 * @property {Object} asset - Information about the asset to transfer
 * @property {string} asset.id - The Ethereum address of the asset
 * @property {number} asset.decimals - The number of decimal places for the asset
 * @property {string} amount - The amount of the asset to transfer
 * @property {string} from - The address of the sender
 * @property {string} to - The address of the receiver
 */
export const AssetFlowSchema = t.Object(
  {
    asset: t.Object(
      {
        id: t.EthereumAddress({
          minLength: 1,
          errorMessage: "error.asset-required",
        }),
        decimals: t.Number({
          description: "The number of decimal places for the asset",
        }),
        symbol: t.String({
          description: "The symbol for the asset",
        }),
      },
      {
        description: "Asset to transfer",
      }
    ),
    amount: t.Amount({
      error: "error.amount-required",
    }),
    from: t.EthereumAddress({
      error: "error.from-address-required",
    }),
    to: t.EthereumAddress({
      error: "error.to-address-required",
    }),
  },
  {
    description: "Asset flow information",
  }
);

export type AssetFlow = StaticDecode<typeof AssetFlowSchema>;

export const CreateXvpSchema = t.Object(
  {
    flows: t.Array(AssetFlowSchema, {
      description: "Asset flows for the settlement",
      minItems: 2,
      error: "error.at-least-two-asset-flows",
    }),
    expiry: t.String({
      description: "The time until which the settlement can be executed.",
      error: "error.expiry-required",
    }),
    autoExecute: t.Boolean({
      description:
        "Whether to automatically execute the settlement on last approval",
    }),
    verificationCode: t.VerificationCode({
      description:
        "The verification code (PIN, 2FA, or secret code) for signing the transaction",
    }),
    verificationType: t.VerificationType({
      description: "The type of verification",
    }),
  },
  {
    $id: "CreateXvpForm",
    additionalProperties: false,
  }
);

export type CreateXvpInput = StaticDecode<typeof CreateXvpSchema>;
