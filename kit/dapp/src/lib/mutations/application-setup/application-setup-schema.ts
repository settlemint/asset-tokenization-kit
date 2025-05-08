import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating application setup mutation inputs
 *
 * @property {string} step - The setup step to execute
 */
export function ApplicationSetupSchema() {
  return t.Object(
    {},
    {
      description: "Schema for validating application setup mutation inputs",
    }
  );
}

export type ApplicationSetupInput = StaticDecode<
  ReturnType<typeof ApplicationSetupSchema>
>;
