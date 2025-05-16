import { t, type StaticDecode } from "@/lib/utils/typebox";

const ContractSchema = t.Object(
  {
    address: t.MaybeEmpty(
      t.EthereumAddress({
        description: "The contract address",
      })
    ),
    abiName: t.String({
      description: "The contract abi name",
    }),
    createdAt: t.Timestamp({
      description: "The timestamp when the contract was created",
    }),
    revertedAt: t.Timestamp({
      description: "The timestamp when the contract was reverted",
    }),
    deployedAt: t.Timestamp({
      description: "The timestamp when the contract was deployed",
    }),
  },
  {
    description: "Contract data",
  }
);

export const ApplicationSetupStatusSchema = t.Object({
  isSetup: t.Boolean({
    description: "Whether the application is setup",
  }),
  contractStatus: t.Array(
    t.Object({
      name: t.String({
        description: "The name of the contract",
      }),
      status: t.UnionEnum(["deployed", "reverted", "pending"], {
        description: "The status of the contract",
      }),
    })
  ),
  deployedContracts: t.Array(ContractSchema),
});

export type ApplicationSetupStatus = StaticDecode<
  typeof ApplicationSetupStatusSchema
>;
