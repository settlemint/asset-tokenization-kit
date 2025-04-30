import { useRouter } from "@/i18n/routing";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { safeParse, t as tb, type StaticDecode } from "@/lib/utils/typebox";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// Define a schema for the input data
const assetFormSchema = tb.Object(
  {
    assetType: tb.String(),
    predictedAddress: tb.String(),
    // Add other fields as needed
  },
  { $id: "AssetForm" }
);

// Define the types
type AssetFormValues = StaticDecode<typeof assetFormSchema>;

/**
 * Example of how to use the asset creation flow
 * This component demonstrates the pattern for handling asset creation
 * with transaction confirmation and navigation
 */
export function AssetDesigner() {
  const router = useRouter();
  const t = useTranslations();

  /**
   * Example of how to handle asset creation success
   * This is typically passed to the Form component's onSuccess prop
   */
  const handleAssetCreateSuccess = async ({
    data,
    input,
  }: {
    data: unknown;
    input: AssetFormValues;
  }) => {
    const hashes = safeParse(tb.Hashes(), data);
    const assetAddress = input.predictedAddress;
    const assetType = input.assetType;

    // Show loading toast
    const toastId = Date.now();
    toast.loading(
      "Creating asset, please wait for blockchain confirmation...",
      {
        id: toastId,
        duration: Infinity,
      }
    );

    try {
      // Wait for transaction confirmation
      await waitForTransactions(hashes);

      // Add a small delay to allow indexing to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      toast.success("Asset created successfully", { id: toastId });

      // Navigate to asset detail page after confirmation
      router.push(`/assets/${assetType}/${assetAddress}`);
    } catch (error) {
      toast.error(`Transaction failed: ${(error as Error).message}`, {
        id: toastId,
      });
    }
  };

  /**
   * Example of how to handle asset creation errors
   */
  const handleAssetCreateError = (error: {
    error?: { serverError?: string; validationErrors?: unknown };
  }) => {
    let errorMessage = "Unknown error";

    if (error?.error?.serverError) {
      errorMessage = error.error.serverError;
    } else if (error?.error?.validationErrors) {
      errorMessage = "Validation error";
    }

    toast.error(`Failed to submit: ${errorMessage}`);
  };

  // This is an example of how to use the Form component for asset creation
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Asset Designer</h1>
      <p className="mb-6">
        This component demonstrates how to implement asset creation with
        transaction confirmation and navigation.
      </p>

      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
        {`
// To implement this pattern in your form:
<Form
  // Other form props...
  onSuccess={handleAssetCreateSuccess}
  onError={handleAssetCreateError}
/>
        `}
      </pre>
    </div>
  );
}
