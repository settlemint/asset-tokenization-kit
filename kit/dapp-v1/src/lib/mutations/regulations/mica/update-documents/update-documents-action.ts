"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { updateDocumentsFunction } from "./update-documents-function";
import { UpdateDocumentsSchema } from "./update-documents-schema";

export const updateDocuments = action
  .schema(UpdateDocumentsSchema())
  .outputSchema(t.Hashes())
  .action(updateDocumentsFunction);
