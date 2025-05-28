import { type StaticDecode, t } from "@/lib/utils/typebox";

export function UpdateAuthorizationSchema() {
  return t.Object(
    {
      regulationId: t.String(),
      licenceNumber: t.Optional(t.String()),
      regulatoryAuthority: t.Optional(t.String()),
      approvalDate: t.Optional(t.String({ format: "date" })),
      approvalDetails: t.Optional(t.String()),
    },
    { $id: "UpdateAuthorization" }
  );
}

export type UpdateAuthorizationInput = StaticDecode<
  ReturnType<typeof UpdateAuthorizationSchema>
>;
