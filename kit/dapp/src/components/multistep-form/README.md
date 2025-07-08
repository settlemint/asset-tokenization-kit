# MultiStep Wizard Component

A comprehensive multi-step wizard component built with TanStack Form, TanStack
Query, and shadcn/ui components. Features URL persistence, collapsible step
groups, async field dependencies, and ORPC integration.

## Features

- **TanStack Form Integration**: Uses TanStack Form for type-safe form handling
- **URL Persistence**: Step progress and form data persisted in URL with
  debouncing
- **Collapsible Groups**: Steps can be organized into collapsible sidebar groups
- **Async Field Dependencies**: Fields can show/hide based on async ORPC calls
- **ORPC Integration**: Built-in support for streaming mutations at each step
- **Validation**: Step-level and field-level validation with Zod schemas
- **Error Boundaries**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Works on all screen sizes with flexible layouts

## Basic Usage

```tsx
import { MultiStepWizard } from "@/components/multistep-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  type: z.enum(["personal", "business"]),
});

type FormData = z.infer<typeof formSchema>;

const steps: StepDefinition<FormData>[] = [
  {
    id: "personal-info",
    title: "Personal Information",
    description: "Enter your basic details",
    fields: [
      {
        name: "name",
        label: "Full Name",
        type: "text",
        required: true,
        schema: z.string().min(1, "Name is required"),
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        schema: z.string().email("Invalid email address"),
      },
    ],
  },
  {
    id: "account-type",
    title: "Account Type",
    fields: [
      {
        name: "type",
        label: "Account Type",
        type: "select",
        required: true,
        options: [
          { label: "Personal", value: "personal" },
          { label: "Business", value: "business" },
        ],
      },
    ],
  },
];

function MyWizard() {
  const handleComplete = async (data: FormData) => {
    console.log("Form completed:", data);
  };

  return (
    <MultiStepWizard<FormData>
      name="my-wizard"
      steps={steps}
      onComplete={handleComplete}
    />
  );
}
```

## Advanced Usage

### With Groups and Custom Components

```tsx
const groups: StepGroup[] = [
  {
    id: "basics",
    title: "Basic Information",
    collapsible: true,
    defaultExpanded: true,
  },
  {
    id: "advanced",
    title: "Advanced Settings",
    collapsible: true,
    defaultExpanded: false,
  },
];

const steps: StepDefinition<FormData>[] = [
  {
    id: "basic-info",
    title: "Basic Info",
    groupId: "basics",
    component: CustomStepComponent, // Custom component
    validate: async (data) => {
      // Custom validation
      if (data.name === "admin") {
        return "Name 'admin' is reserved";
      }
    },
  },
  {
    id: "advanced-settings",
    title: "Advanced",
    groupId: "advanced",
    fields: [
      {
        name: "advancedField",
        label: "Advanced Field",
        type: "custom",
        component: CustomFieldComponent,
        dependsOn: async (data) => {
          // Async dependency check
          const response = await fetch(`/api/check/${data.type}`);
          return response.ok;
        },
      },
    ],
  },
];
```

### With ORPC Integration

```tsx
const steps: StepDefinition<FormData>[] = [
  {
    id: "final-step",
    title: "Complete Setup",
    mutation: {
      mutationKey: "create-account",
      mutationFn: async (data: Partial<FormData>) => {
        // ORPC mutation
        return await orpc.account.create.mutate(data);
      },
    },
    onStepComplete: async (data) => {
      // Custom logic after step completion
      console.log("Account created:", data);
    },
  },
];
```

## Props

### MultiStepWizard Props

| Prop                   | Type                                 | Default | Description                                   |
| ---------------------- | ------------------------------------ | ------- | --------------------------------------------- |
| `name`                 | `string`                             | -       | Unique identifier for URL persistence         |
| `steps`                | `StepDefinition[]`                   | -       | Array of step definitions                     |
| `groups`               | `StepGroup[]`                        | -       | Optional step groups for sidebar organization |
| `onComplete`           | `(data: T) => void \| Promise<void>` | -       | Called when wizard is completed               |
| `enableUrlPersistence` | `boolean`                            | `true`  | Enable URL state persistence                  |
| `debounceMs`           | `number`                             | `300`   | Debounce delay for URL updates                |
| `showProgressBar`      | `boolean`                            | `true`  | Show progress bar in sidebar                  |
| `allowStepSkipping`    | `boolean`                            | `false` | Allow navigating to any step                  |
| `persistFormData`      | `boolean`                            | `true`  | Persist form data in URL                      |
| `defaultValues`        | `Partial<T>`                         | `{}`    | Default form values                           |

### StepDefinition

```tsx
interface StepDefinition<T> {
  id: string;
  title: string;
  description?: string;
  groupId?: string;
  fields?: FieldDefinition<T>[];
  validate?: (
    data: Partial<T>
  ) => Promise<string | undefined> | string | undefined;
  onStepComplete?: (data: Partial<T>) => Promise<void> | void;
  mutation?: {
    mutationKey: string;
    mutationFn: (data: Partial<T>) => Promise<unknown>;
  };
  dependsOn?: (data: Partial<T>) => Promise<boolean> | boolean;
  component?: React.ComponentType<StepComponentProps<T>>;
}
```

### FieldDefinition

```tsx
interface FieldDefinition<T> {
  name: keyof T;
  label: string;
  description?: string;
  type:
    | "text"
    | "number"
    | "email"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "custom";
  placeholder?: string;
  required?: boolean;
  schema?: z.ZodType;
  options?: Array<{ label: string; value: string }>;
  dependsOn?: (data: Partial<T>) => Promise<boolean> | boolean;
  component?: React.ComponentType<FieldComponentProps<T>>;
  postfix?: string;
}
```

## Custom Components

### Custom Step Component

```tsx
function CustomStepComponent({
  form,
  stepId,
  onNext,
  onPrevious,
}: StepComponentProps<FormData>) {
  return (
    <div className="space-y-4">
      <h2>Custom Step</h2>
      {/* Your custom step content */}
      <div className="flex justify-between">
        <Button onClick={onPrevious}>Previous</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
```

### Custom Field Component

```tsx
function CustomFieldComponent({
  field,
  fieldDefinition,
}: FieldComponentProps<FormData>) {
  return (
    <div className="space-y-2">
      <Label>{fieldDefinition.label}</Label>
      <div className="custom-field">
        {/* Your custom field implementation */}
      </div>
      {field.state.meta.errors.length > 0 && (
        <p className="text-destructive text-sm">
          {field.state.meta.errors.join(", ")}
        </p>
      )}
    </div>
  );
}
```

## URL State Structure

The wizard persists state in the URL using the following structure:

```
/path?my-wizard[step]=2&my-wizard[completed]=step1,step2&my-wizard[data]={"name":"John","email":"john@example.com"}
```

- `step`: Current step index
- `completed`: Comma-separated list of completed step IDs
- `data`: JSON-encoded form data
- `errors`: JSON-encoded step errors (if any)

## Error Handling

The wizard includes comprehensive error handling:

```tsx
import { withWizardErrorBoundary } from "@/components/multistep-form";

const MyWizard = withWizardErrorBoundary(MyWizardComponent);
```

## Performance Considerations

- Form data is automatically memoized and only updates when values change
- URL updates are debounced to prevent excessive navigation
- Step validation is only run when moving between steps
- Field dependencies are checked asynchronously without blocking the UI

## Integration with Existing Patterns

The wizard follows the same patterns as the DataTable component:

- Uses the same URL state management approach
- Follows the same error handling patterns
- Uses the same logging utilities
- Compatible with the existing shadcn/ui components

## Examples

See `example-wizard.tsx` for a complete implementation example showing:

- Multi-step token creation wizard
- Collapsible step groups
- Field dependencies
- ORPC integration
- Custom validation
- Error handling
