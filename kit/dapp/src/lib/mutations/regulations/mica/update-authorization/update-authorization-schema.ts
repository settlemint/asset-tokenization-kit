import { type StaticDecode, t } from "@/lib/utils/typebox";

export function UpdateAuthorizationSchema() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return t.Object(
    {
      regulationId: t.String(),
      licenceNumber: t.Optional(t.String()), // MiCA does not specify a specific licence number format
      regulatoryAuthority: t.Optional(t.String()),
      approvalDate: t.Optional(
        t.Union([
          t.String({
            format: "date",
            maximum: today,
            error: "Approval date cannot be in the future",
          }),
          t.Null(),
        ])
      ),
      approvalDetails: t.Optional(t.String()),
    },
    { $id: "UpdateAuthorization" }
  );
}

export type UpdateAuthorizationInput = StaticDecode<
  ReturnType<typeof UpdateAuthorizationSchema>
>;
