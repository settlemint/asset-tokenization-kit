import { PageHeaderSkeleton } from "@/components/layout/page-header.skeleton";
import { CardSkeleton } from "@/components/ui/card-skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton section />
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <CardSkeleton /> {/* UpdateNameCard */}
        <CardSkeleton /> {/* ChangeEmailCard */}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4">
        <CardSkeleton /> {/* PincodeCard */}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <CardSkeleton /> {/* ChangePasswordCard */}
        <CardSkeleton /> {/* SecretCodesCard */}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <CardSkeleton /> {/* ProvidersCard */}
        <CardSkeleton /> {/* PasskeysCard */}
      </div>
      <CardSkeleton /> {/* DeleteAccountCard */}
    </>
  );
}
