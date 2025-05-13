import { t, type StaticDecode } from "@/lib/utils/typebox";

const ContractSchema = t.Object(
  {
    address: t.EthereumAddress({
      description: "The contract address",
    }),
    abiName: t.String({
      description: "The contract abi name",
    }),
    createdAt: t.Timestamp({
      description: "The timestamp when the contract was created as Date object",
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
  deployedContracts: t.Array(ContractSchema),
});

export type ApplicationSetupStatus = StaticDecode<
  typeof ApplicationSetupStatusSchema
>;
