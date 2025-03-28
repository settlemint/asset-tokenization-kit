import { type StaticDecode, t } from "@/lib/utils/typebox";

export function getAddAdminFormSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The wallet address of the admin",
      }),
      firstName: t.String({
        description: "First name of the admin",
        minLength: 1,
        errorMessage: "First name is required",
      }),
      lastName: t.String({
        description: "Last name of the admin",
        minLength: 1,
        errorMessage: "Last name is required",
      }),
    },
    {
      description: "Schema for validating add admin form inputs",
    }
  );
}

export type AddAdminFormType = StaticDecode<
  ReturnType<typeof getAddAdminFormSchema>
>;
