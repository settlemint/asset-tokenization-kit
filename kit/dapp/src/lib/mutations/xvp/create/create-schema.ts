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
          errorMessage: "Asset is required",
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
      error: "Amount is required",
    }),
    from: t.EthereumAddress({
      error: "From address is required and must be a valid EVM address",
    }),
    to: t.EthereumAddress({
      error: "To address is required and must be a valid EVM address",
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
      error: "At least two asset flows are required",
    }),
    expiry: t.String({
      description: "The time until which the settlement can be executed.",
      error: "Expiry is required",
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
