import { VerificationButton as VerificationButtonComponent } from "@/components/verification-dialog/verification-button";
import { useFormContext } from "@/hooks/use-form-contexts";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { AnyFieldMeta } from "@tanstack/react-form";

/**
 * Form-integrated verification button that enforces security boundaries for blockchain operations.
 *
 * @remarks
 * SECURITY: This component acts as a critical security boundary between form validation
 * and blockchain operations. It ensures that wallet verification is completed before
 * any sensitive operations (token transfers, minting, role changes) are executed.
 *
 * ARCHITECTURE: Bridges TanStack Form state management with the verification dialog system,
 * providing a consistent UX pattern across all sensitive operations in the asset tokenization platform.
 *
 * VALIDATION FLOW:
 * 1. Form validation runs first (client-side validation via Zod schemas)
 * 2. Wallet verification is triggered (OTP/PINCODE/SECRET_CODES)
 * 3. Only after both succeed, the actual operation is submitted
 *
 * @param children - Button content (typically submit label)
 * @param onSubmit - Callback executed after successful form validation and wallet verification
 * @param disabled - Dynamic disable logic based on form state or static boolean
 * @param walletVerification - Configuration for the verification dialog and field binding
 */
export function VerificationButton({
  children,
  onSubmit,
  disabled,
  walletVerification,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
  disabled?:
    | boolean
    | ((args: { isDirty: boolean; errors: AnyFieldMeta["errors"] }) => boolean);
  walletVerification: {
    title: string;
    description: string;
    setField: (verfication: UserVerification) => void;
  };
}) {
  // WHY: Access form context to integrate with TanStack Form state management
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        isValid: state.isValid,
        isDirty: state.isDirty,
        errors: state.errors,
      })}
    >
      {({ isSubmitting, isValid, isDirty, errors }) => {
        return (
          <VerificationButtonComponent
            walletVerification={walletVerification}
            onSubmit={async (userVerification) => {
              // SECURITY: Store verification result in form field before proceeding
              // This ensures the verification data is available for the final submission
              walletVerification.setField(userVerification);

              // VALIDATION: Re-validate entire form after verification data is set
              // This catches any validation rules that depend on verification being present
              await form.validateAllFields("change");

              // SAFETY: Double-check form validity before allowing operation to proceed
              // Prevents edge cases where form state might have changed during verification
              if (form.state.isValid) {
                onSubmit();
              }
            }}
            disabled={
              // TRADEOFF: Complex disable logic balances UX responsiveness vs data integrity
              // Function-based disable allows dynamic evaluation based on current form state
              (typeof disabled === "function"
                ? disabled({
                    isDirty,
                    errors,
                  })
                : disabled) ||
              // EDGE CASE: Prevent double-submission during async operations
              isSubmitting ||
              // VALIDATION: Block submission if form has validation errors
              !isValid
            }
          >
            {children}
          </VerificationButtonComponent>
        );
      }}
    </form.Subscribe>
  );
}
