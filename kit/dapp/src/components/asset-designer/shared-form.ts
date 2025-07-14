import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { formOptions } from "@tanstack/react-form";

export const formOpts = formOptions({
  defaultValues: {} as TokenCreateInput,
});
