import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Web3Address } from "@/components/web3/web3-address";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

interface BaseActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Pick<Token, "id" | "name" | "symbol">;
  title: string;
  description: string;
  submit: ReactNode;
  onCancel: () => void;
  children?: ReactNode; // For form fields
  showAssetDetails?: boolean;
  isSubmitting?: boolean;
}

interface ActionSheetFooterProps {
  onCancel: () => void;
  isSubmitting?: boolean;
  cancelLabel?: string;
  children: ReactNode; // The submit button/content
}

/**
 * Reusable footer component for action sheets
 * Provides consistent layout with cancel and submit actions
 */
export function ActionSheetFooter({
  onCancel,
  isSubmitting = false,
  cancelLabel,
  children,
}: ActionSheetFooterProps) {
  const { t } = useTranslation(["common"]);

  return (
    <SheetFooter className="px-6 py-4 border-t mt-auto">
      <div className="flex w-full items-center justify-between gap-2">
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="press-effect"
          >
            {cancelLabel ?? t("common:actions.cancel")}
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </SheetFooter>
  );
}

/**
 * Base component for manage action sheets (mint, transfer, burn, etc.)
 * Provides consistent layout and structure for all token management actions
 *
 * @example
 * ```tsx
 * <BaseActionSheet
 *   open={open}
 *   onOpenChange={setOpen}
 *   asset={token}
 *   title="Mint Tokens"
 *   description="Create new tokens for the specified recipient"
 *   onProceed={handleMint}
 *   onCancel={handleCancel}
 * >
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Mint Details</CardTitle>
 *     </CardHeader>
 *     <CardContent>
 *       // Your form fields here
 *     </CardContent>
 *   </Card>
 * </BaseActionSheet>
 * ```
 */
export function BaseActionSheet({
  open,
  onOpenChange,
  asset,
  title,
  description,
  submit,
  onCancel,
  children,
  showAssetDetails = true,
  isSubmitting = false,
}: BaseActionSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const handleCancel = useCallback(() => {
    onCancel();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="min-w-[34rem] p-0 flex flex-col h-full"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Asset Details Card - shown by default */}
            {showAssetDetails && asset && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("tokens:details.tokenInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Token Address */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">
                      {t("tokens:fields.contractAddress")}
                    </span>
                    <Web3Address
                      address={asset.id}
                      copyToClipboard
                      showFullAddress={false}
                      showPrettyName={false}
                      showBadge={false}
                      size="tiny"
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* Token Name */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">
                      {t("tokens:fields.name")}
                    </span>
                    <span className="text-sm font-medium">{asset.name}</span>
                  </div>

                  {/* Token Symbol */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">
                      {t("tokens:fields.symbol")}
                    </span>
                    <span className="text-sm font-medium">{asset.symbol}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom content - form fields, additional cards, etc. */}
            {children}
          </div>
        </div>

        <ActionSheetFooter onCancel={handleCancel} isSubmitting={isSubmitting}>
          {submit}
        </ActionSheetFooter>
      </SheetContent>
    </Sheet>
  );
}
