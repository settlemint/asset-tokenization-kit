import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { orpc } from "@/orpc";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2, Pause, Play } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Verification form schema for pause/unpause operations
 */
const VerificationSchema = z.object({
  verificationCode: z.string().min(6, "Verification code must be 6 digits"),
  verificationType: z.literal("pincode"),
});

type VerificationFormValues = z.infer<typeof VerificationSchema>;

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
  const {
    mutate: pauseToken,
    isPending: isPausing,
    isTracking: isTrackingPause,
  } = useStreamingMutation({
    mutationOptions: orpc.token.pause.mutationOptions(),
    onSuccess: async () => {
      // Invalidate token query to refresh the paused state
      await queryClient.invalidateQueries({
        queryKey: orpc.token.read.key({
          input: { tokenAddress: token.id },
        }),
      });
      setOpenAction(null);
      form.reset();
    },
  });

  // Unpause mutation
  const {
    mutate: unpauseToken,
    isPending: isUnpausing,
    isTracking: isTrackingUnpause,
  } = useStreamingMutation({
    mutationOptions: orpc.token.unpause.mutationOptions(),
    onSuccess: async () => {
      // Invalidate token query to refresh the paused state
      await queryClient.invalidateQueries({
        queryKey: orpc.token.read.key({
          input: { tokenAddress: token.id },
        }),
      });
      setOpenAction(null);
      form.reset();
    },
  });

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: {
      verificationCode: "",
      verificationType: "pincode",
    },
  });

  const handleSubmit = useCallback(
    (values: VerificationFormValues) => {
      if (openAction === "pause") {
        pauseToken({
          contract: token.id,
          verification: values,
          messages: {
            preparingPause: t("tokens:actions.pause.messages.preparing"),
            submittingPause: t("tokens:actions.pause.messages.submitting"),
            tokenPaused: t("tokens:actions.pause.messages.success"),
            pauseFailed: t("tokens:actions.pause.messages.failed"),
            defaultError: t("tokens:actions.pause.messages.error"),
            waitingForMining: t("common:transaction.waitingForMining"),
            transactionIndexed: t("common:transaction.indexed"),
          },
        });
      } else if (openAction === "unpause") {
        unpauseToken({
          contract: token.id,
          verification: values,
          messages: {
            preparingUnpause: t("tokens:actions.unpause.messages.preparing"),
            submittingUnpause: t("tokens:actions.unpause.messages.submitting"),
            tokenUnpaused: t("tokens:actions.unpause.messages.success"),
            unpauseFailed: t("tokens:actions.unpause.messages.failed"),
            defaultError: t("tokens:actions.unpause.messages.error"),
            waitingForMining: t("common:transaction.waitingForMining"),
            transactionIndexed: t("common:transaction.indexed"),
          },
        });
      }
    },
    [openAction, pauseToken, unpauseToken, token.id, t]
  );

  const actions = useMemo(
    () => [
      {
        id: isPaused ? "unpause" : "pause",
        label: isPaused
          ? t("tokens:actions.unpause.label")
          : t("tokens:actions.pause.label"),
        icon: isPaused ? Play : Pause,
        onClick: () => setOpenAction(isPaused ? "unpause" : "pause"),
        disabled: false,
      },
    ],
    [isPaused, t]
  );

  const isLoading = isPausing || isUnpausing;
  const isTracking = isTrackingPause || isTrackingUnpause;

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

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
          <DropdownMenuItem
            onSelect={() => {
              // TODO: Navigate to events page
            }}
          >
            {t("tokens:actions.viewEvents")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet
        open={openAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenAction(null);
            form.reset();
          }
        }}
      >
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

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 mt-6"
            >
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("common:verification.pincode.label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="123456"
                        disabled={isLoading || isTracking}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("common:verification.pincode.description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenAction(null);
                    form.reset();
                  }}
                  disabled={isLoading || isTracking}
                >
                  {t("common:actions.cancel")}
                </Button>
                <Button type="submit" disabled={isLoading || isTracking}>
                  {isLoading || isTracking ? (
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
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
