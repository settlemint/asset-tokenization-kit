import { useWizardContext } from "@/components/multistep-form/wizard-context";
import { memo, useCallback, useState } from "react";

/**
 * Add Personal Information Step Component
 *
 * Handles both the intro screen and the form screen within a single step.
 */
export const AddPersonalInformationComponent = memo(
  function AddPersonalInformationComponent({
    onNext,
    onPrevious,
    isFirstStep,
  }: {
    onNext?: () => void;
    onPrevious?: () => void;
    isFirstStep?: boolean;
  }) {
    const { form } = useWizardContext();

    // State to track current screen
    const [currentScreen, setCurrentScreen] = useState<"intro" | "form">(
      "intro"
    );

    // Handle continue from intro to form
    const handleContinueToForm = useCallback(() => {
      setCurrentScreen("form");
    }, []);

    // Handle skip - goes directly to next step
    const handleSkip = useCallback(() => {
      onNext?.();
    }, [onNext]);

    // Handle form submission
    const handleFormSubmit = useCallback(() => {
      // Here you would typically validate and save the form data
      onNext?.();
    }, [onNext]);

    // Handle back from form to intro
    const handleBackToIntro = useCallback(() => {
      setCurrentScreen("intro");
    }, []);

    // Render intro screen
    const renderIntroScreen = () => (
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Add Personal Information</h2>
          <p className="text-muted-foreground">
            Required for identity registration and KYC verification
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm">
            To complete your identity and use the platform, we need some basic
            information. This helps us meet regulatory requirements (KYC/AML)
            and allows your identity to be registered on the blockchain.
          </p>

          <p className="text-sm">
            You can skip this step for now, but registration won't be possible
            until your country is provided.
          </p>

          <p className="text-sm">
            Your data is securely stored and used only for compliance purposes.
            You'll be able to update or complete it later from the dashboard.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
            >
              Previous
            </button>
          )}
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleContinueToForm}
            className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Continue
          </button>
        </div>
      </div>
    );

    // Render form screen
    const renderFormScreen = () => (
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            Complete Your Personal Information
          </h2>
          <p className="text-muted-foreground">
            Help us verify your identity and enable registration
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm">
            We use this information to verify your identity and meet compliance
            requirements.
          </p>
          <p className="text-sm">
            You'll be able to update or complete this later from your dashboard.
          </p>
          <p className="text-sm">
            <strong>
              Fields marked with * are required. Country is required for
              identity registration.
            </strong>
          </p>
        </div>

        <div className="space-y-6">
          {/* Name - Pre-filled */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name (pre-filled)</label>
            <div className="grid grid-cols-2 gap-3">
              <form.Field name="firstName">
                {(field: {
                  state: { value?: string; meta: { errors?: string[] } };
                  handleChange: (value: string) => void;
                }) => (
                  <div>
                    <input
                      id="firstName"
                      type="text"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      placeholder="First name"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>
              <form.Field name="lastName">
                {(field: {
                  state: { value?: string; meta: { errors?: string[] } };
                  handleChange: (value: string) => void;
                }) => (
                  <div>
                    <input
                      id="lastName"
                      type="text"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      placeholder="Last name"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive mt-1">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* Email - Pre-filled */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email (pre-filled)</label>
            <form.Field name="email">
              {(field: {
                state: { value?: string; meta: { errors?: string[] } };
                handleChange: (value: string) => void;
              }) => (
                <div>
                  <input
                    id="email"
                    type="email"
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    placeholder="Email address"
                  />
                  {field.state.meta.errors &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Date of birth */}
          <form.Field name="dateOfBirth">
            {(field: {
              state: { value?: string; meta: { errors?: string[] } };
              handleChange: (value: string) => void;
            }) => (
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          {/* Country * */}
          <form.Field name="nationality">
            {(field: {
              state: { value?: string; meta: { errors?: string[] } };
              handleChange: (value: string) => void;
            }) => (
              <div className="space-y-2">
                <label htmlFor="nationality" className="text-sm font-medium">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="nationality"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">Select your country</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Other</option>
                </select>
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          {/* Residency status */}
          <form.Field name="residencyStatus">
            {(field: {
              state: { value?: string; meta: { errors?: string[] } };
              handleChange: (value: string) => void;
            }) => (
              <div className="space-y-3">
                <label className="text-sm font-medium">Residency status</label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="residencyStatus"
                      value="resident"
                      checked={field.state.value === "resident"}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium">Resident</div>
                      <div className="text-sm text-muted-foreground">
                        I currently live in this country and am considered a
                        legal/tax resident.
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="residencyStatus"
                      value="non-resident"
                      checked={field.state.value === "non-resident"}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium">Non-resident</div>
                      <div className="text-sm text-muted-foreground">
                        I do not live in this country and am not considered a
                        legal/tax resident.
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="residencyStatus"
                      value="dual-resident"
                      checked={field.state.value === "dual-resident"}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium">Dual resident</div>
                      <div className="text-sm text-muted-foreground">
                        I am considered a resident in more than one country.
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="residencyStatus"
                      value="unknown"
                      checked={field.state.value === "unknown"}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium">
                        Unknown / Prefer not to say
                      </div>
                    </div>
                  </label>
                </div>
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          {/* National ID / SSN */}
          <form.Field name="nationalId">
            {(field: {
              state: { value?: string; meta: { errors?: string[] } };
              handleChange: (value: string) => void;
            }) => (
              <div className="space-y-2">
                <label htmlFor="nationalId" className="text-sm font-medium">
                  National ID / SSN (optional)
                </label>
                <input
                  id="nationalId"
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  placeholder="Enter your National ID or SSN (optional)"
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          {/* Upload government issued ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Upload a government issued ID
            </label>
            <div className="space-y-2">
              <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  id="governmentId"
                />
                <label
                  htmlFor="governmentId"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Passport, National ID card
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Webcam verification question */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              (Should we verify ID via Webcam selfie?)
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="text-sm text-muted-foreground border-t pt-4">
          (*) needed for identity registration
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={handleBackToIntro}
            className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Save and continue
          </button>
        </div>
      </div>
    );

    // Render based on current screen
    return (
      <div className="space-y-6">
        {currentScreen === "intro" ? renderIntroScreen() : renderFormScreen()}
      </div>
    );
  }
);
