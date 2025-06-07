# Internationalization (i18n) for Zod Validation

This guide explains how to use internationalized validation messages with Zod in the frontend.

## Setup

### 1. Set the Error Map Globally

In your app's initialization code (e.g., `app/layout.tsx` or `_app.tsx`):

```typescript
import { z } from 'zod';
import { zodErrorMap } from '@/lib/utils/zod';

// Set the error map globally
z.setErrorMap(zodErrorMap);
```

### 2. Add Translations to Your Messages Files

Copy the validation translations to your message files:

```bash
# Copy the provided translations structure
cp src/lib/utils/zod/validation-translations.json messages/validation-en.json
```

Then merge these translations into your existing message files:

```json
// messages/en.json
{
  "existing": "translations",
  // Add the validation object from validation-translations.json
  "validation": {
    // ... validation translations
  }
}
```

### 3. Use in Components

```typescript
import { useTranslations } from 'next-intl';
import { ethereumAddress } from '@/lib/utils/zod/ethereum-address';

export function AddressForm() {
  const t = useTranslations();
  
  const handleSubmit = (data: unknown) => {
    const result = ethereumAddress.safeParse(data.address);
    
    if (!result.success) {
      // The error message is a translation key
      const errorKey = result.error.issues[0].message;
      const errorMessage = t(errorKey);
      
      // Display the translated error
      setError(errorMessage);
    }
  };
}
```

### 4. With React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { ethereumAddress } from '@/lib/utils/zod/ethereum-address';

const schema = z.object({
  address: ethereumAddress,
});

export function Form() {
  const t = useTranslations();
  
  const form = useForm({
    resolver: zodResolver(schema, {
      // Custom error map that translates on the fly
      errorMap: (issue, ctx) => {
        const key = zodErrorMap(issue, ctx);
        return { message: t(key) };
      }
    }),
  });
}
```

## Translation Key Structure

All validation error keys follow this pattern:

- **Base Zod errors**: `validation.{errorType}` or `validation.{errorType}.{subType}`
- **Custom validator errors**: `validation.custom.{validatorName}.{errorType}`

### Examples:

- `validation.required` - Field is required
- `validation.invalidType.string` - Expected string type
- `validation.string.minLength` - String too short
- `validation.custom.ethereumAddress.invalid` - Invalid Ethereum address
- `validation.custom.isin.invalidCheckDigit` - ISIN check digit failed

## Interpolation

Some messages support interpolation for dynamic values:

```json
{
  "validation": {
    "string": {
      "minLength": "Please enter at least {{minimum}} characters"
    }
  }
}
```

Use with next-intl's interpolation:

```typescript
const errorMessage = t(errorKey, {
  minimum: issue.minimum,
  maximum: issue.maximum,
  expected: issue.expected,
  // etc.
});
```

## Custom Validators

When creating custom validators, use the `customErrorKey` helper:

```typescript
import { z } from 'zod';
import { customErrorKey } from '@/lib/utils/zod';

export const myValidator = z
  .string()
  .refine(
    (value) => isValid(value),
    { message: customErrorKey('myValidator', 'invalid') }
  );
```

Then add the corresponding translation:

```json
{
  "validation": {
    "custom": {
      "myValidator": {
        "invalid": "Please enter a valid value"
      }
    }
  }
}
```

## Testing

When testing components with validation:

```typescript
import { zodErrorMap } from '@/lib/utils/zod';

// Mock translations
const mockT = (key: string) => {
  // Return the key or a test message
  return `test.${key}`;
};

// Or use actual translations
import messages from '@/messages/en.json';
const t = (key: string) => {
  // Navigate the nested structure
  const keys = key.split('.');
  return keys.reduce((obj, k) => obj?.[k], messages) || key;
};
```

## Benefits

1. **Consistency**: All validation messages follow the same translation pattern
2. **Type Safety**: TypeScript ensures translation keys are valid
3. **Maintainability**: Translations are centralized and easy to update
4. **Flexibility**: Can override specific messages or use defaults
5. **Performance**: Translation happens only when errors occur

## Migration Guide

To migrate existing validators:

1. Import `customErrorKey`:
   ```typescript
   import { customErrorKey } from './error-map';
   ```

2. Replace hardcoded messages:
   ```typescript
   // Before
   .refine(isValid, { message: "Please enter a valid value" })
   
   // After
   .refine(isValid, { message: customErrorKey('validatorName', 'invalid') })
   ```

3. Add translations to your message files

4. Test that errors display correctly