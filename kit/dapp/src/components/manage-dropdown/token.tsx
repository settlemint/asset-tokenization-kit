import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "@/components/form/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2, Pause, Play } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Verification form values for pause/unpause operations
 */
interface VerificationFormValues {
  verificationCode: string;
  verificationType: "pincode";
}

interface ManageDropdownProps {
  token: Token;
}

export function ManageDropdown({ token }: ManageDropdownProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const queryClient = useQueryClient();
  const [openAction, setOpenAction] = useState<"pause" | "unpause" | null>(
    null
  );

  const isPaused = token.pausable.paused;

  // Pause mutation
  const { mutate: pauseToken, isPending: isPausing } = useMutation(
    orpc.token.pause.mutationOptions({
      onSuccess: async (data) => {
        // Invalidate token query to refresh the paused state
        await queryClient.invalidateQueries({
          queryKey: orpc.token.read.key({
            input: { tokenAddress: token.id },
          }),
        });
        setOpenAction(null);
        form.reset();
        toast.success(
          t("actions.pause.messages.success", {
            defaultValue: `Token '${data.name} (${data.symbol})' paused successfully`,
            name: data.name,
            symbol: data.symbol,
          })
        );
      },
      onError: (error) => {
        toast.error(t("actions.pause.messages.error"), {
          description: error.message,
        });
      },
    })
  );

  // Unpause mutation
  const { mutate: unpauseToken, isPending: isUnpausing } = useMutation(
    orpc.token.unpause.mutationOptions({
      onSuccess: async (data) => {
        // Invalidate token query to refresh the paused state
        await queryClient.invalidateQueries({
          queryKey: orpc.token.read.key({
            input: { tokenAddress: token.id },
          }),
        });
        setOpenAction(null);
        form.reset();
        toast.success(
          t("actions.unpause.messages.success", {
            defaultValue: `Token '${data.name} (${data.symbol})' resumed successfully`,
            name: data.name,
            symbol: data.symbol,
          })
        );
      },
      onError: (error) => {
        toast.error(t("actions.unpause.messages.error"), {
          description: error.message,
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      verificationCode: "",
      verificationType: "pincode" as const,
    },
    onSubmit: ({ value }: { value: VerificationFormValues }) => {
      handleSubmit(value);
    },
  });

  const handleSubmit = useCallback(
    (values: VerificationFormValues) => {
      if (openAction === "pause") {
        pauseToken({
          contract: token.id,
          verification: values,
        });
      } else if (openAction === "unpause") {
        unpauseToken({
          contract: token.id,
          verification: values,
        });
      }
    },
    [openAction, pauseToken, unpauseToken, token.id]
  );

  const actions = useMemo(
    () => [
      {
        id: isPaused ? "unpause" : "pause",
        label: isPaused
          ? t("tokens:actions.unpause.label")
          : t("tokens:actions.pause.label"),
        icon: isPaused ? Play : Pause,
        onClick: () => {
          setOpenAction(isPaused ? "unpause" : "pause");
        },
        disabled: false,
      },
    ],
    [isPaused, t]
  );

  const isLoading = isPausing || isUnpausing;

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setOpenAction(null);
        form.reset();
      }
    },
    [form]
  );

  const handleCancel = useCallback(() => {
    setOpenAction(null);
    form.reset();
  }, [form]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2">
            {t("tokens:manage")}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          align="end"
          sideOffset={4}
        >
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onSelect={action.onClick}
              disabled={action.disabled}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            {t("tokens:actions.viewEvents")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={openAction !== null} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          className="min-w-[25rem]"
          onOpenAutoFocus={handleOpenAutoFocus}
        >
          <SheetHeader>
            <SheetTitle>
              {openAction === "pause"
                ? t("tokens:actions.pause.title")
                : t("tokens:actions.unpause.title")}
            </SheetTitle>
            <SheetDescription>
              {openAction === "pause"
                ? t("tokens:actions.pause.description")
                : t("tokens:actions.unpause.description")}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="space-y-6 mt-6"
          >
            <form.Field
              name="verificationCode"
              validators={{
                onChange: ({ value }) => {
                  if (value.length < 6) {
                    return "Verification code must be 6 digits";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FieldLayout>
                  <FieldLabel
                    htmlFor="verificationCode"
                    label={t("common:verification.pincode.label")}
                  />
                  <Input
                    id="verificationCode"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    onBlur={field.handleBlur}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    disabled={isLoading}
                  />
                  <FieldDescription
                    description={t("common:verification.pincode.description")}
                  />
                  <FieldErrors {...field.state.meta} />
                </FieldLayout>
              )}
            </form.Field>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {t("common:actions.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {openAction === "pause"
                      ? t("tokens:actions.pause.submitting")
                      : t("tokens:actions.unpause.submitting")}
                  </>
                ) : openAction === "pause" ? (
                  t("tokens:actions.pause.submit")
                ) : (
                  t("tokens:actions.unpause.submit")
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
