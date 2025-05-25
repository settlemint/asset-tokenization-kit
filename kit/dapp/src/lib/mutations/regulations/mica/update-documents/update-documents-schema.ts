import {
  DocumentStatus,
  MicaDocumentType,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { type StaticDecode, t } from "@/lib/utils/typebox";

const DocumentSchema = t.Object(
  {
    id: t.String(),
    title: t.String(),
    type: t.Union([
      t.Literal(MicaDocumentType.WHITE_PAPER),
      t.Literal(MicaDocumentType.AUDIT),
      t.Literal(MicaDocumentType.POLICY),
      t.Literal(MicaDocumentType.GOVERNANCE),
      t.Literal(MicaDocumentType.PROCEDURE),
    ]),
    url: t.String({
      format: "uri",
      error: "Must be a valid URL",
    }),
    status: t.Union([
      t.Literal(DocumentStatus.PENDING),
      t.Literal(DocumentStatus.APPROVED),
      t.Literal(DocumentStatus.REJECTED),
    ]),
    description: t.Optional(t.String()),
  },
  { $id: "MicaDocument" }
);

export const DocumentOperation = {
  ADD: "add",
  DELETE: "delete",
} as const;

export type DocumentOperation =
  (typeof DocumentOperation)[keyof typeof DocumentOperation];

export function UpdateDocumentsSchema() {
  return t.Object(
    {
      regulationId: t.String(),
      operation: t.Union([
        t.Literal(DocumentOperation.ADD),
        t.Literal(DocumentOperation.DELETE),
      ]),
      document: DocumentSchema,
    },
    { $id: "UpdateDocuments" }
  );
}

export type UpdateDocumentsInput = StaticDecode<
  ReturnType<typeof UpdateDocumentsSchema>
>;

// Export the document schema for reuse if needed
export type MicaDocumentInput = StaticDecode<typeof DocumentSchema>;
