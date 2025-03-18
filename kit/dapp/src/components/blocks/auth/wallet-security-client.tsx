"use client";

import {
  PincodeForm,
  type PincodeFormValues,
} from "@/components/blocks/auth/pincode-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "@/i18n/routing";
import { setPinCode } from "@/lib/mutations/user/set-pincode";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";

interface WalletSecurityClientProps {
  children: ReactNode;
  hasVerification: boolean;
  walletAddress: Address;
}

export function WalletSecurityClient({
  children,
  walletAddress,
  hasVerification,
}: WalletSecurityClientProps) {
  const [showDialog, setShowDialog] = useState(!hasVerification);
  const t = useTranslations("private.auth.wallet-security");
  const router = useRouter();

  const onSubmit = async (data: PincodeFormValues) => {
    try {
      setShowDialog(false);
      await setPinCode({
        name: data.pincodeName,
        address: walletAddress,
        pincode: data.pincode,
      });
      toast.success(t("pincode-set"));
      router.refresh();
    } catch (error) {
      console.error("Failed to set pincode:", error);
    }
  };

  return (
    <>
      {!walletAddress || hasVerification ? (
        children
      ) : (
        <div className="min-h-screen w-full bg-[url('/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("setup-pincode")}</DialogTitle>
                <DialogDescription>
                  {t("pincode-instruction")}
                </DialogDescription>
              </DialogHeader>

              <PincodeForm onSubmit={onSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
