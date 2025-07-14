import { fieldContext, formContext } from "@/hooks/use-form-contexts";
import { createFormHook } from "@tanstack/react-form";

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    // TextField,
  },
  formComponents: {
    // SubscribeButton,
  },
  fieldContext,
  formContext,
});
