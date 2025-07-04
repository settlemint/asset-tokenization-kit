import { z } from "zod";
import { MultiStepWizard } from "./multistep-wizard";
import { withWizardErrorBoundary } from "./wizard-error-boundary";
import type { StepDefinition, StepGroup } from "./types";

// Example form schema
const tokenFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  description: z.string().optional(),

  // Token Details
  tokenType: z.enum(["equity", "bond", "deposit", "fund", "stablecoin"]),
  totalSupply: z.number().min(1, "Total supply must be positive"),
  decimals: z.number().min(0).max(18, "Decimals must be between 0 and 18"),

  // Compliance
  requiresKYC: z.boolean().default(false),
  complianceRegion: z.string().optional(),

  // Advanced
  mintable: z.boolean().default(false),
  burnable: z.boolean().default(false),
  pausable: z.boolean().default(false),
});

type TokenFormData = z.infer<typeof tokenFormSchema>;

// Example groups
const groups: StepGroup[] = [
  {
    id: "basic",
    title: "Basic Information",
    description: "Token name, symbol, and description",
    collapsible: true,
    defaultExpanded: true,
  },
  {
    id: "advanced",
    title: "Advanced Settings",
    description: "Technical configuration",
    collapsible: true,
    defaultExpanded: false,
  },
];

// Example steps
const steps: StepDefinition<TokenFormData>[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Enter the basic details for your token",
    groupId: "basic",
    fields: [
      {
        name: "name",
        label: "Token Name",
        type: "text",
        required: true,
        placeholder: "e.g., My Token",
        description: "The full name of your token",
        schema: z.string().min(1, "Name is required"),
      },
      {
        name: "symbol",
        label: "Token Symbol",
        type: "text",
        required: true,
        placeholder: "e.g., MTK",
        description: "A short symbol for your token (2-6 characters)",
        schema: z.string().min(2).max(6, "Symbol must be 2-6 characters"),
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Describe your token...",
        description: "Optional description of your token",
      },
    ],
    validate: async (data) => {
      // Example validation - check if symbol is unique
      if (data.symbol && data.symbol.toLowerCase() === "reserved") {
        return "This symbol is reserved";
      }
      return undefined;
    },
  },
  {
    id: "token-type",
    title: "Token Type",
    description: "Select the type of token to create",
    groupId: "basic",
    fields: [
      {
        name: "tokenType",
        label: "Token Type",
        type: "select",
        required: true,
        options: [
          { label: "Equity Token", value: "equity" },
          { label: "Bond Token", value: "bond" },
          { label: "Deposit Token", value: "deposit" },
          { label: "Fund Token", value: "fund" },
          { label: "Stablecoin", value: "stablecoin" },
        ],
        schema: z.enum(["equity", "bond", "deposit", "fund", "stablecoin"]),
      },
    ],
  },
  {
    id: "token-details",
    title: "Token Details",
    description: "Configure token economics",
    fields: [
      {
        name: "totalSupply",
        label: "Total Supply",
        type: "number",
        required: true,
        placeholder: "1000000",
        description: "The total number of tokens to create",
        schema: z.number().min(1, "Total supply must be positive"),
      },
      {
        name: "decimals",
        label: "Decimals",
        type: "number",
        required: true,
        placeholder: "18",
        description: "Number of decimal places (0-18)",
        schema: z.number().min(0).max(18, "Decimals must be between 0 and 18"),
      },
    ],
  },
  {
    id: "compliance",
    title: "Compliance Settings",
    description: "Configure compliance requirements",
    fields: [
      {
        name: "requiresKYC",
        label: "Require KYC verification",
        type: "checkbox",
        description: "Require users to complete KYC before trading",
      },
      {
        name: "complianceRegion",
        label: "Compliance Region",
        type: "select",
        dependsOn: (data) => !!data.requiresKYC,
        options: [
          { label: "European Union", value: "eu" },
          { label: "United States", value: "us" },
          { label: "Asia Pacific", value: "apac" },
        ],
        description: "Select the primary compliance region",
      },
    ],
  },
  {
    id: "advanced-settings",
    title: "Advanced Settings",
    description: "Advanced token features",
    groupId: "advanced",
    fields: [
      {
        name: "mintable",
        label: "Mintable",
        type: "checkbox",
        description: "Allow creating new tokens after deployment",
      },
      {
        name: "burnable",
        label: "Burnable",
        type: "checkbox",
        description: "Allow token holders to burn their tokens",
      },
      {
        name: "pausable",
        label: "Pausable",
        type: "checkbox",
        description: "Allow pausing token transfers",
      },
    ],
  },
  {
    id: "review",
    title: "Review & Deploy",
    description: "Review your token configuration before deployment",
    mutation: {
      mutationKey: "create-token",
      mutationFn: async (data: Partial<TokenFormData>) => {
        // Example mutation - replace with actual ORPC call
        console.log("Creating token:", data);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return { success: true, address: "0x123...abc" };
      },
    },
  },
];

interface ExampleWizardProps {
  onComplete?: (data: TokenFormData) => void;
}

function ExampleWizardComponent({ onComplete }: ExampleWizardProps) {
  const handleComplete = async (data: TokenFormData) => {
    console.log("Token creation completed:", data);
    if (onComplete) {
      onComplete(data);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Token</h1>
        <p className="text-muted-foreground">
          Follow the steps below to create and deploy your token
        </p>
      </div>

      <MultiStepWizard<TokenFormData>
        name="token-creation"
        steps={steps}
        groups={groups}
        onComplete={handleComplete}
        enableUrlPersistence={true}
        showProgressBar={true}
        allowStepSkipping={false}
        persistFormData={true}
        defaultValues={{
          decimals: 18,
          requiresKYC: false,
          mintable: false,
          burnable: false,
          pausable: false,
        }}
      />
    </div>
  );
}

export const ExampleWizard = withWizardErrorBoundary(ExampleWizardComponent);
export default ExampleWizard;
